"""
Payment service for the Eiendomsmuligheter Platform.

This module provides integration with Stripe for:
- Subscription management for premium and partner accounts
- One-time payments for services
- Customer management
- Invoicing and receipts
- Webhooks for payment events
"""
import os
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import stripe
import json
import uuid
from enum import Enum
from pydantic import BaseModel, Field

# Set up logging
logger = logging.getLogger(__name__)

# Initialize Stripe with API keys
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "sk_test_your_test_key")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_your_webhook_secret")

stripe.api_key = STRIPE_API_KEY

# Product and pricing configuration
PRODUCTS = {
    "premium": {
        "name": "Premium abonnement",
        "description": "Tilgang til avanserte analyser, 3D-modellering og mer",
        "monthly_price_id": "price_monthly_premium",  # Would be actual Stripe price ID in production
        "yearly_price_id": "price_yearly_premium",  # Would be actual Stripe price ID in production
        "features": [
            "Eiendomsanalyse",
            "3D-modellering",
            "Verdivurdering",
            "Utviklingspotensialeanalyse",
            "Ubegrenset søk"
        ]
    },
    "partner": {
        "name": "Partner abonnement",
        "description": "For eiendomsmeglere, utviklere og profesjonelle aktører",
        "monthly_price_id": "price_monthly_partner",  # Would be actual Stripe price ID in production
        "yearly_price_id": "price_yearly_partner",  # Would be actual Stripe price ID in production
        "features": [
            "Alle Premium-funksjoner",
            "API-tilgang",
            "White-label rapporter",
            "Klientadministrasjon",
            "Prioritert support"
        ]
    },
    "3d_model": {
        "name": "3D-modell",
        "description": "Engangskjøp av 3D-modell for en eiendom",
        "price_id": "price_3d_model",  # Would be actual Stripe price ID in production
        "price_amount": 499,  # NOK
        "features": [
            "Høyoppløselig 3D-modell",
            "Inkluderer terreng og bygninger",
            "Nedlastbar i flere formater"
        ]
    },
    "property_report": {
        "name": "Eiendomsrapport",
        "description": "Omfattende rapport om eiendommens potensiale",
        "price_id": "price_property_report",  # Would be actual Stripe price ID in production
        "price_amount": 999,  # NOK
        "features": [
            "Verdivurdering",
            "Reguleringsanalyse",
            "Utviklingspotensiale",
            "Markedsanalyse",
            "PDF-rapport"
        ]
    }
}

class SubscriptionPeriod(str, Enum):
    """Subscription period options"""
    MONTHLY = "monthly"
    YEARLY = "yearly"

class PaymentStatus(str, Enum):
    """Payment status options"""
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELED = "canceled"

class SubscriptionStatus(str, Enum):
    """Subscription status options"""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"

class PaymentIntent(BaseModel):
    """Payment intent model"""
    id: str
    client_secret: str
    amount: int
    currency: str = "nok"
    status: PaymentStatus
    created_at: datetime
    payment_method_types: List[str] = ["card"]
    metadata: Dict[str, str] = Field(default_factory=dict)

class Subscription(BaseModel):
    """Subscription model"""
    id: str
    customer_id: str
    product_id: str
    price_id: str
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    canceled_at: Optional[datetime] = None
    metadata: Dict[str, str] = Field(default_factory=dict)

class Customer(BaseModel):
    """Customer model"""
    id: str
    email: str
    name: Optional[str] = None
    payment_methods: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    metadata: Dict[str, str] = Field(default_factory=dict)

class Invoice(BaseModel):
    """Invoice model"""
    id: str
    customer_id: str
    subscription_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    amount: int
    currency: str = "nok"
    status: str
    created_at: datetime
    due_date: datetime
    paid_at: Optional[datetime] = None
    lines: List[Dict[str, Any]] = Field(default_factory=list)
    pdf_url: Optional[str] = None
    metadata: Dict[str, str] = Field(default_factory=dict)

class PaymentService:
    """Service for handling payments and subscriptions"""
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None, user_id: Optional[str] = None) -> Customer:
        """
        Create a new customer in Stripe.
        
        Args:
            email: Customer email
            name: Customer name
            user_id: User ID for reference
            
        Returns:
            Customer object
        """
        try:
            # Create customer in Stripe
            stripe_customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"user_id": user_id} if user_id else {}
            )
            
            # Convert to our model
            customer = Customer(
                id=stripe_customer.id,
                email=stripe_customer.email,
                name=stripe_customer.name,
                payment_methods=[],
                created_at=datetime.fromtimestamp(stripe_customer.created),
                metadata=stripe_customer.metadata
            )
            
            logger.info(f"Created customer: {customer.id} for user {user_id}")
            return customer
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create customer: {str(e)}")
            raise ValueError(f"Failed to create customer: {str(e)}")
    
    @staticmethod
    def get_customer(customer_id: str) -> Customer:
        """
        Get customer from Stripe.
        
        Args:
            customer_id: Stripe customer ID
            
        Returns:
            Customer object
        """
        try:
            # Get customer from Stripe
            stripe_customer = stripe.Customer.retrieve(customer_id)
            
            # Get payment methods
            payment_methods = []
            try:
                payment_methods_response = stripe.PaymentMethod.list(
                    customer=customer_id,
                    type="card"
                )
                payment_methods = payment_methods_response.data
            except stripe.error.StripeError as e:
                logger.warning(f"Failed to retrieve payment methods: {str(e)}")
            
            # Convert to our model
            customer = Customer(
                id=stripe_customer.id,
                email=stripe_customer.email,
                name=stripe_customer.name,
                payment_methods=[{
                    "id": pm.id,
                    "type": pm.type,
                    "card": {
                        "brand": pm.card.brand,
                        "last4": pm.card.last4,
                        "exp_month": pm.card.exp_month,
                        "exp_year": pm.card.exp_year,
                    }
                } for pm in payment_methods],
                created_at=datetime.fromtimestamp(stripe_customer.created),
                metadata=stripe_customer.metadata
            )
            
            return customer
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to get customer {customer_id}: {str(e)}")
            raise ValueError(f"Failed to get customer: {str(e)}")
    
    @staticmethod
    def create_checkout_session(
        customer_id: str,
        product_id: str,
        subscription_period: Optional[SubscriptionPeriod] = None,
        success_url: str = "https://eiendomsmuligheter.no/payment/success",
        cancel_url: str = "https://eiendomsmuligheter.no/payment/cancel",
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session.
        
        Args:
            customer_id: Stripe customer ID
            product_id: Product ID from our PRODUCTS dictionary
            subscription_period: For subscriptions, whether monthly or yearly
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect after canceled payment
            metadata: Additional metadata for the session
            
        Returns:
            Checkout session details including URL
        """
        try:
            metadata = metadata or {}
            
            if product_id not in PRODUCTS:
                raise ValueError(f"Unknown product ID: {product_id}")
            
            product = PRODUCTS[product_id]
            
            # Determine if this is a subscription or one-time payment
            is_subscription = product_id in ["premium", "partner"]
            
            line_items = []
            
            if is_subscription:
                if not subscription_period:
                    raise ValueError("subscription_period is required for subscription products")
                
                price_id = product[f"{subscription_period}_price_id"]
                line_items.append({
                    "price": price_id,
                    "quantity": 1
                })
                
                mode = "subscription"
            else:
                # One-time payment
                price_id = product["price_id"]
                line_items.append({
                    "price": price_id,
                    "quantity": 1
                })
                
                mode = "payment"
            
            # Create checkout session
            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=line_items,
                mode=mode,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "product_id": product_id,
                    "subscription_period": subscription_period if subscription_period else "none",
                    **metadata
                }
            )
            
            return {
                "id": checkout_session.id,
                "url": checkout_session.url,
                "payment_status": checkout_session.payment_status,
                "customer_id": customer_id,
                "product_id": product_id,
                "is_subscription": is_subscription,
                "subscription_period": subscription_period,
                "expires_at": datetime.fromtimestamp(checkout_session.expires_at) if checkout_session.expires_at else None
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create checkout session: {str(e)}")
            raise ValueError(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    def create_payment_intent(
        customer_id: str,
        product_id: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> PaymentIntent:
        """
        Create a payment intent for direct integration.
        
        Args:
            customer_id: Stripe customer ID
            product_id: Product ID from our PRODUCTS dictionary
            metadata: Additional metadata for the payment intent
            
        Returns:
            PaymentIntent object
        """
        try:
            metadata = metadata or {}
            
            if product_id not in PRODUCTS:
                raise ValueError(f"Unknown product ID: {product_id}")
            
            product = PRODUCTS[product_id]
            
            # Only support one-time payments with this method
            if product_id in ["premium", "partner"]:
                raise ValueError("Use create_checkout_session for subscription products")
            
            amount = product["price_amount"] * 100  # Convert to øre
            
            # Create payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="nok",
                customer=customer_id,
                payment_method_types=["card"],
                metadata={
                    "product_id": product_id,
                    **metadata
                }
            )
            
            # Convert to our model
            return PaymentIntent(
                id=payment_intent.id,
                client_secret=payment_intent.client_secret,
                amount=payment_intent.amount,
                currency=payment_intent.currency,
                status=payment_intent.status,
                created_at=datetime.fromtimestamp(payment_intent.created),
                payment_method_types=payment_intent.payment_method_types,
                metadata=payment_intent.metadata
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create payment intent: {str(e)}")
            raise ValueError(f"Failed to create payment intent: {str(e)}")
    
    @staticmethod
    def cancel_subscription(
        subscription_id: str,
        at_period_end: bool = True
    ) -> Subscription:
        """
        Cancel a subscription.
        
        Args:
            subscription_id: Stripe subscription ID
            at_period_end: Whether to cancel at the end of the current period
            
        Returns:
            Updated Subscription object
        """
        try:
            # Cancel subscription in Stripe
            stripe_subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=at_period_end
            )
            
            if not at_period_end:
                stripe_subscription = stripe.Subscription.delete(subscription_id)
            
            # Convert to our model
            subscription = Subscription(
                id=stripe_subscription.id,
                customer_id=stripe_subscription.customer,
                product_id=stripe_subscription.items.data[0].price.product,
                price_id=stripe_subscription.items.data[0].price.id,
                status=stripe_subscription.status,
                current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end),
                cancel_at_period_end=stripe_subscription.cancel_at_period_end,
                canceled_at=datetime.fromtimestamp(stripe_subscription.canceled_at) if stripe_subscription.canceled_at else None,
                metadata=stripe_subscription.metadata
            )
            
            logger.info(f"Canceled subscription: {subscription_id}, at period end: {at_period_end}")
            return subscription
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {str(e)}")
            raise ValueError(f"Failed to cancel subscription: {str(e)}")
    
    @staticmethod
    def get_subscription(subscription_id: str) -> Subscription:
        """
        Get subscription details.
        
        Args:
            subscription_id: Stripe subscription ID
            
        Returns:
            Subscription object
        """
        try:
            # Get subscription from Stripe
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Convert to our model
            subscription = Subscription(
                id=stripe_subscription.id,
                customer_id=stripe_subscription.customer,
                product_id=stripe_subscription.items.data[0].price.product,
                price_id=stripe_subscription.items.data[0].price.id,
                status=stripe_subscription.status,
                current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end),
                cancel_at_period_end=stripe_subscription.cancel_at_period_end,
                canceled_at=datetime.fromtimestamp(stripe_subscription.canceled_at) if stripe_subscription.canceled_at else None,
                metadata=stripe_subscription.metadata
            )
            
            return subscription
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to get subscription {subscription_id}: {str(e)}")
            raise ValueError(f"Failed to get subscription: {str(e)}")
    
    @staticmethod
    def list_invoices(customer_id: str, limit: int = 10) -> List[Invoice]:
        """
        List invoices for a customer.
        
        Args:
            customer_id: Stripe customer ID
            limit: Maximum number of invoices to return
            
        Returns:
            List of Invoice objects
        """
        try:
            # Get invoices from Stripe
            invoices_response = stripe.Invoice.list(
                customer=customer_id,
                limit=limit
            )
            
            # Convert to our model
            invoices = []
            for invoice in invoices_response.data:
                invoice_obj = Invoice(
                    id=invoice.id,
                    customer_id=invoice.customer,
                    subscription_id=invoice.subscription,
                    payment_intent_id=invoice.payment_intent,
                    amount=invoice.total,
                    currency=invoice.currency,
                    status=invoice.status,
                    created_at=datetime.fromtimestamp(invoice.created),
                    due_date=datetime.fromtimestamp(invoice.due_date) if invoice.due_date else None,
                    paid_at=datetime.fromtimestamp(invoice.status_transitions.paid_at) if invoice.status_transitions.paid_at else None,
                    lines=[{
                        "description": line.description,
                        "amount": line.amount,
                        "currency": invoice.currency,
                        "quantity": line.quantity
                    } for line in invoice.lines.data],
                    pdf_url=invoice.invoice_pdf,
                    metadata=invoice.metadata
                )
                invoices.append(invoice_obj)
            
            return invoices
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to list invoices for customer {customer_id}: {str(e)}")
            raise ValueError(f"Failed to list invoices: {str(e)}")
    
    @staticmethod
    def handle_webhook(payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Handle Stripe webhook event.
        
        Args:
            payload: Webhook payload as bytes
            signature: Stripe signature header
            
        Returns:
            Processed event data
        """
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, STRIPE_WEBHOOK_SECRET
            )
            
            # Process different event types
            event_data = {
                "id": event.id,
                "type": event.type,
                "created": datetime.fromtimestamp(event.created),
                "data": event.data.object,
                "processed": True,
                "processing_result": {}
            }
            
            if event.type == "checkout.session.completed":
                # Handle successful checkout
                session = event.data.object
                customer_id = session.customer
                metadata = session.metadata
                
                event_data["processing_result"] = {
                    "customer_id": customer_id,
                    "product_id": metadata.get("product_id"),
                    "subscription_period": metadata.get("subscription_period"),
                    "is_subscription": session.mode == "subscription"
                }
                
                # In a real app, we would update the user's subscription status in our database
                
            elif event.type == "invoice.paid":
                # Handle paid invoice
                invoice = event.data.object
                customer_id = invoice.customer
                subscription_id = invoice.subscription
                
                event_data["processing_result"] = {
                    "customer_id": customer_id,
                    "subscription_id": subscription_id,
                    "amount": invoice.total,
                    "currency": invoice.currency
                }
                
                # In a real app, we would update the user's subscription status in our database
                
            elif event.type == "customer.subscription.updated":
                # Handle subscription update
                subscription = event.data.object
                customer_id = subscription.customer
                
                event_data["processing_result"] = {
                    "customer_id": customer_id,
                    "subscription_id": subscription.id,
                    "status": subscription.status,
                    "cancel_at_period_end": subscription.cancel_at_period_end
                }
                
                # In a real app, we would update the user's subscription status in our database
                
            elif event.type == "customer.subscription.deleted":
                # Handle subscription cancellation
                subscription = event.data.object
                customer_id = subscription.customer
                
                event_data["processing_result"] = {
                    "customer_id": customer_id,
                    "subscription_id": subscription.id,
                    "status": subscription.status
                }
                
                # In a real app, we would update the user's subscription status in our database
            
            logger.info(f"Processed webhook event: {event.id}, type: {event.type}")
            return event_data
            
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {str(e)}")
            raise ValueError("Invalid webhook signature")
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            raise ValueError(f"Error processing webhook: {str(e)}")

# Initialize service
payment_service = PaymentService() 