"""
Payment routes for the Eiendomsmuligheter Platform API.

This module provides endpoints for payment processing, including:
- Subscription management
- One-time payments
- Customer management
- Invoice handling
- Webhook processing
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request, Response, Header
from fastapi.responses import JSONResponse, RedirectResponse
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, EmailStr
import logging
import json
import os
from datetime import datetime

# Import custom modules
try:
    from middleware.auth import get_current_active_user, get_premium_user, get_admin_user, User
    from services.payment import (
        payment_service, 
        Customer, 
        PaymentIntent, 
        Subscription, 
        Invoice,
        SubscriptionPeriod,
        PRODUCTS
    )
except ImportError:
    # Fallback for direct imports
    from backend.middleware.auth import get_current_active_user, get_premium_user, get_admin_user, User
    from backend.services.payment import (
        payment_service, 
        Customer, 
        PaymentIntent, 
        Subscription, 
        Invoice,
        SubscriptionPeriod,
        PRODUCTS
    )

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/payments",
    tags=["payments"],
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Not found"},
        status.HTTP_400_BAD_REQUEST: {"description": "Bad request"},
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"}
    }
)

# Request and response models
class CreateCustomerRequest(BaseModel):
    """Request model for creating a customer"""
    name: str
    email: EmailStr
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Ola Nordmann",
                "email": "ola.nordmann@example.com"
            }
        }

class CheckoutSessionRequest(BaseModel):
    """Request model for creating a checkout session"""
    product_id: str
    subscription_period: Optional[SubscriptionPeriod] = None
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None
    metadata: Dict[str, str] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "product_id": "premium",
                "subscription_period": "monthly",
                "success_url": "https://eiendomsmuligheter.no/payment/success",
                "cancel_url": "https://eiendomsmuligheter.no/payment/cancel",
                "metadata": {
                    "user_id": "user-123"
                }
            }
        }

class PaymentIntentRequest(BaseModel):
    """Request model for creating a payment intent"""
    product_id: str
    metadata: Dict[str, str] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "product_id": "3d_model",
                "metadata": {
                    "property_id": "property-123"
                }
            }
        }

class CancelSubscriptionRequest(BaseModel):
    """Request model for canceling a subscription"""
    subscription_id: str
    at_period_end: bool = True
    
    class Config:
        schema_extra = {
            "example": {
                "subscription_id": "sub_123456789",
                "at_period_end": True
            }
        }

class ProductResponse(BaseModel):
    """Response model for product information"""
    id: str
    name: str
    description: str
    features: List[str]
    price_monthly: Optional[int] = None
    price_yearly: Optional[int] = None
    price: Optional[int] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "premium",
                "name": "Premium abonnement",
                "description": "Tilgang til avanserte analyser, 3D-modellering og mer",
                "features": [
                    "Eiendomsanalyse",
                    "3D-modellering",
                    "Verdivurdering",
                    "Utviklingspotensialeanalyse",
                    "Ubegrenset søk"
                ],
                "price_monthly": 299,
                "price_yearly": 2990
            }
        }

# Mock customer database (in a real app, this would be in a database)
CUSTOMER_DB = {}

# Get or create customer ID for a user
async def get_customer_id(user: User) -> str:
    """
    Get or create a Stripe customer ID for a user.
    
    Args:
        user: The authenticated user
        
    Returns:
        Stripe customer ID
    """
    # Check if user already has a customer ID
    if user.id in CUSTOMER_DB:
        return CUSTOMER_DB[user.id]
    
    # Create new customer
    try:
        customer = payment_service.create_customer(
            email=user.email,
            name=user.full_name,
            user_id=user.id
        )
        
        # Store customer ID
        CUSTOMER_DB[user.id] = customer.id
        
        return customer.id
    except ValueError as e:
        logger.error(f"Failed to create customer for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment customer"
        )

# Routes
@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    current_user: User = Depends(get_current_active_user)
):
    """
    List available products and pricing.
    
    This endpoint returns a list of available subscription plans and one-time purchase options.
    """
    products = []
    
    for product_id, product_data in PRODUCTS.items():
        product = {
            "id": product_id,
            "name": product_data["name"],
            "description": product_data["description"],
            "features": product_data["features"]
        }
        
        # Add pricing based on product type
        if product_id in ["premium", "partner"]:
            # Subscription products
            product["price_monthly"] = 299 if product_id == "premium" else 999  # Example prices
            product["price_yearly"] = 2990 if product_id == "premium" else 9990  # Example prices
        else:
            # One-time products
            product["price"] = product_data["price_amount"]
        
        products.append(product)
    
    return products

@router.post("/customers", response_model=Customer)
async def create_customer(
    request: CreateCustomerRequest,
    current_user: User = Depends(get_admin_user)
):
    """
    Create a new customer in the payment system.
    
    This endpoint is primarily used by administrators to create customers.
    Normal users are automatically registered as customers when making their first payment.
    """
    try:
        customer = payment_service.create_customer(
            email=request.email,
            name=request.name
        )
        
        return customer
    except ValueError as e:
        logger.error(f"Failed to create customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create customer: {str(e)}"
        )

@router.get("/customers/me", response_model=Customer)
async def get_current_customer(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's customer information.
    
    This endpoint returns the authenticated user's payment customer information,
    including saved payment methods.
    """
    try:
        # Get or create customer ID
        customer_id = await get_customer_id(current_user)
        
        # Get customer details
        customer = payment_service.get_customer(customer_id)
        
        return customer
    except ValueError as e:
        logger.error(f"Failed to get customer for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get customer information: {str(e)}"
        )

@router.post("/checkout", response_model=Dict[str, Any])
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a checkout session for subscription or one-time payment.
    
    This endpoint creates a Stripe checkout session and returns the session URL
    that the client should redirect to.
    """
    try:
        # Get or create customer ID
        customer_id = await get_customer_id(current_user)
        
        # Create checkout session
        checkout_session = payment_service.create_checkout_session(
            customer_id=customer_id,
            product_id=request.product_id,
            subscription_period=request.subscription_period,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={
                "user_id": current_user.id,
                **request.metadata
            }
        )
        
        return checkout_session
    except ValueError as e:
        logger.error(f"Failed to create checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@router.post("/payment-intents", response_model=PaymentIntent)
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a payment intent for direct payment integration.
    
    This endpoint creates a Stripe payment intent and returns the client secret
    that the client can use to complete the payment.
    """
    try:
        # Get or create customer ID
        customer_id = await get_customer_id(current_user)
        
        # Create payment intent
        payment_intent = payment_service.create_payment_intent(
            customer_id=customer_id,
            product_id=request.product_id,
            metadata={
                "user_id": current_user.id,
                **request.metadata
            }
        )
        
        return payment_intent
    except ValueError as e:
        logger.error(f"Failed to create payment intent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create payment intent: {str(e)}"
        )

@router.get("/subscriptions", response_model=List[Subscription])
async def list_subscriptions(
    current_user: User = Depends(get_current_active_user)
):
    """
    List the user's active subscriptions.
    
    This endpoint returns a list of the authenticated user's active subscriptions.
    """
    # In a real implementation, we would query the database for subscriptions
    # For this demo, we return mock data
    
    # Check if user has a customer ID
    if current_user.id not in CUSTOMER_DB:
        return []
    
    # Mock data
    subscriptions = [
        Subscription(
            id=f"sub_{hash(current_user.id) % 1000000}",
            customer_id=CUSTOMER_DB[current_user.id],
            product_id="premium",
            price_id="price_monthly_premium",
            status="active",
            current_period_start=datetime.now(),
            current_period_end=datetime.now(),
            cancel_at_period_end=False,
            metadata={"user_id": current_user.id}
        )
    ]
    
    return subscriptions

@router.get("/subscriptions/{subscription_id}", response_model=Subscription)
async def get_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details about a specific subscription.
    
    This endpoint returns detailed information about a specific subscription.
    """
    try:
        # Get subscription details
        subscription = payment_service.get_subscription(subscription_id)
        
        # Verify that the subscription belongs to the user
        customer_id = await get_customer_id(current_user)
        if subscription.customer_id != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this subscription"
            )
        
        return subscription
    except ValueError as e:
        logger.error(f"Failed to get subscription {subscription_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get subscription: {str(e)}"
        )

@router.post("/subscriptions/cancel", response_model=Subscription)
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a subscription.
    
    This endpoint cancels a subscription, either immediately or at the end of the current billing period.
    """
    try:
        # Get subscription details first to verify ownership
        subscription = payment_service.get_subscription(request.subscription_id)
        
        # Verify that the subscription belongs to the user
        customer_id = await get_customer_id(current_user)
        if subscription.customer_id != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this subscription"
            )
        
        # Cancel subscription
        updated_subscription = payment_service.cancel_subscription(
            subscription_id=request.subscription_id,
            at_period_end=request.at_period_end
        )
        
        return updated_subscription
    except ValueError as e:
        logger.error(f"Failed to cancel subscription {request.subscription_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to cancel subscription: {str(e)}"
        )

@router.get("/invoices", response_model=List[Invoice])
async def list_invoices(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """
    List the user's invoices.
    
    This endpoint returns a list of the authenticated user's invoices.
    """
    try:
        # Get or create customer ID
        customer_id = await get_customer_id(current_user)
        
        # List invoices
        invoices = payment_service.list_invoices(
            customer_id=customer_id,
            limit=limit
        )
        
        return invoices
    except ValueError as e:
        logger.error(f"Failed to list invoices: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list invoices: {str(e)}"
        )

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """
    Handle Stripe webhook events.
    
    This endpoint receives and processes webhook events from Stripe,
    such as successful payments, subscription updates, etc.
    """
    try:
        # Get request body
        payload = await request.body()
        
        # Verify webhook signature and process event
        event_data = payment_service.handle_webhook(payload, stripe_signature)
        
        # Process event based on type
        event_type = event_data.get("type")
        
        if event_type == "checkout.session.completed":
            # Handle successful checkout
            # In a real app, we would update the user's subscription status
            pass
        elif event_type == "invoice.paid":
            # Handle paid invoice
            # In a real app, we would update subscription status
            pass
        elif event_type == "customer.subscription.updated":
            # Handle subscription update
            # In a real app, we would update subscription status
            pass
        elif event_type == "customer.subscription.deleted":
            # Handle subscription deletion
            # In a real app, we would update subscription status
            pass
        
        return {"status": "success", "event_id": event_data.get("id")}
    except ValueError as e:
        logger.error(f"Failed to process webhook: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": str(e)}
        )