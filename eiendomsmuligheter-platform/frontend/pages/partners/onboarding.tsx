"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building, 
  Upload, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Briefcase,
  Image,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  AlertTriangle,
  FileText,
  Trash2,
  Plus,
  Check
} from 'lucide-react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Partner type definitions
const partnerTypes = [
  { id: 'bank', name: 'Bank', icon: <CreditCard size={24} /> },
  { id: 'insurance', name: 'Forsikringsselskap', icon: <ShieldCheck size={24} /> },
  { id: 'contractor', name: 'Entreprenør', icon: <Briefcase size={24} /> }
];

// Component for a button with gradient styling
const GradientButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium 
    flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 
    disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
  >
    {children}
  </button>
);

// Component for a secondary button
const SecondaryButton = ({ children, onClick, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium 
    border border-white/20 flex items-center justify-center transition-all ${className}`}
  >
    {children}
  </button>
);

// Input Component
const FormInput = ({ label, name, type = 'text', placeholder = '', className = '', required = false }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-blue-100 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <Field
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
      placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
    <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-400" />
  </div>
);

// TextArea Component
const FormTextArea = ({ label, name, placeholder = '', rows = 4, className = '', required = false }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-blue-100 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <Field
      as="textarea"
      id={name}
      name={name}
      rows={rows}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white 
      placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
    <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-400" />
  </div>
);

// File Upload Component
const FileUpload = ({ label, name, accept = "image/*", onFileSelect, preview = null, required = false }) => {
  const inputRef = React.useRef(null);
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-blue-100 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="mt-2">
        {preview ? (
          <div className="relative mb-4 flex items-center">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 mr-4 flex items-center justify-center">
              <img 
                src={typeof preview === 'string' ? preview : URL.createObjectURL(preview)} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <p className="text-sm text-white mb-1">{preview.name || 'Opplastet fil'}</p>
              <button 
                type="button" 
                onClick={() => onFileSelect(null)}
                className="text-xs text-red-400 flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Fjern fil
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer
            hover:border-blue-400/40 transition-colors"
          >
            <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <p className="text-sm text-blue-100">
              Dra og slipp fil her, eller <span className="text-blue-400">bla gjennom</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PNG, JPG, GIF opptil 10MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={(e) => {
            if (e.target.files) {
              onFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Checkbox Component
const FormCheckbox = ({ name, label, className = '' }) => (
  <div className="flex items-center mb-4">
    <Field
      type="checkbox"
      id={name}
      name={name}
      className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/5 border-white/10 ${className}`}
    />
    <label htmlFor={name} className="ml-3 block text-white">
      {label}
    </label>
    <ErrorMessage name={name} component="div" className="ml-2 text-sm text-red-400" />
  </div>
);

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

// InfoTip Component
const InfoTip = ({ children }) => (
  <div className="flex items-start mt-2 mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
    <Info size={20} className="text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
    <div className="text-sm text-blue-100">{children}</div>
  </div>
);

// Step 1: Welcome Step
const WelcomeStep = ({ data, onUpdate, onNext }) => {
  const [selectedType, setSelectedType] = useState(data.company?.type || '');

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onUpdate('company', { type });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">Velkommen til Eiendomsmuligheter Partner!</h2>
        <p className="text-blue-100 mb-6">
          Vi er glade for at {data.company?.name || 'din bedrift'} har valgt å bli partner med oss. 
          Denne onboardingprosessen vil guide deg gjennom de nødvendige trinnene for å sette opp partnerskapet.
        </p>

        <InfoTip>
          Som partner vil du få tilgang til unike muligheter for å nå ut til potensielle kunder 
          som er interessert i eiendomsutvikling. Vårt partnernettverk er sentralt for å tilby 
          komplette løsninger til våre brukere.
        </InfoTip>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Bekreft din bedriftstype</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partnerTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all
                ${selectedType === type.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className={`p-3 rounded-full mb-3 ${selectedType === type.id ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                  {React.cloneElement(type.icon, { 
                    className: selectedType === type.id ? 'text-blue-400' : 'text-gray-400' 
                  })}
                </div>
                <span className={`font-medium ${selectedType === type.id ? 'text-blue-400' : 'text-white'}`}>
                  {type.name}
                </span>
                {selectedType === type.id && (
                  <div className="mt-2 text-blue-400">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <GradientButton 
            onClick={onNext} 
            disabled={!selectedType}
            className="px-8"
          >
            Neste trinn <ArrowRight size={18} className="ml-2" />
          </GradientButton>
        </div>
      </Card>
    </motion.div>
  );
};

// Step 2: Profile Step
const ProfileStep = ({ data, onUpdate, onNext, onBack }) => {
  const [logo, setLogo] = useState(data.company?.logo || null);
  
  const handleLogoChange = (file) => {
    setLogo(file);
    onUpdate('company', { logo: file });
  };

  // Validation schema for profile step
  const validationSchema = Yup.object().shape({
    company: Yup.object().shape({
      name: Yup.string().required('Bedriftsnavn er påkrevd'),
      description: Yup.string().required('Kort beskrivelse er påkrevd'),
      longDescription: Yup.string(),
      benefits: Yup.array().of(Yup.string()).min(1, 'Legg til minst én fordel')
    }),
    contact: Yup.object().shape({
      address: Yup.string().required('Adresse er påkrevd'),
      phone: Yup.string().required('Telefonnummer er påkrevd'),
      email: Yup.string().email('Ugyldig e-postadresse').required('E-post er påkrevd'),
      website: Yup.string().url('Oppgi en gyldig URL').required('Nettside er påkrevd')
    })
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">Bedriftsprofil</h2>
        <p className="text-blue-100 mb-6">
          La oss sette opp din bedriftsprofil. Denne informasjonen vil være synlig for potensielle kunder 
          på Eiendomsmuligheter-plattformen.
        </p>

        <Formik
          initialValues={{
            company: {
              name: data.company?.name || '',
              description: data.company?.description || '',
              longDescription: data.company?.longDescription || '',
              benefits: data.company?.benefits || ['']
            },
            contact: {
              address: data.contact?.address || '',
              phone: data.contact?.phone || '',
              email: data.contact?.email || '',
              website: data.contact?.website || '',
              openingHours: data.contact?.openingHours || ''
            }
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onUpdate('company', values.company);
            onUpdate('contact', values.contact);
            onNext();
          }}
        >
          {({ values, isValid, dirty }) => (
            <Form className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Bedriftsinformasjon</h3>
                <FileUpload 
                  label="Bedriftslogo" 
                  name="logo" 
                  onFileSelect={handleLogoChange} 
                  preview={logo}
                  required
                />
                <FormInput 
                  label="Bedriftsnavn" 
                  name="company.name" 
                  placeholder="Skriv inn bedriftsnavn" 
                  required 
                />
                <FormTextArea 
                  label="Kort beskrivelse" 
                  name="company.description" 
                  placeholder="En kort beskrivelse av din bedrift (maks 160 tegn)" 
                  rows={2}
                  required 
                />
                <FormTextArea 
                  label="Detaljert beskrivelse" 
                  name="company.longDescription" 
                  placeholder="En grundigere beskrivelse av din bedrift, tjenester og verdier" 
                  rows={4}
                />

                <div className="mt-6">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Nøkkelfordeler for kunder <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Legg til opptil 4 nøkkelfordeler som din bedrift tilbyr kundene
                  </p>
                  
                  <FieldArray name="company.benefits">
                    {({ push, remove }) => (
                      <div>
                        {values.company.benefits.map((benefit, index) => (
                          <div key={index} className="flex mb-3">
                            <Field
                              name={`company.benefits.${index}`}
                              placeholder={`Fordel ${index + 1}`}
                              className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
                              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {values.company.benefits.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="ml-2 p-2 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                        {values.company.benefits.length < 4 && (
                          <button
                            type="button"
                            onClick={() => push('')}
                            className="mt-2 flex items-center text-sm text-blue-400 hover:text-blue-300"
                          >
                            <Plus size={16} className="mr-1" /> Legg til fordel
                          </button>
                        )}
                      </div>
                    )}
                  </FieldArray>
                  <ErrorMessage name="company.benefits" component="div" className="mt-1 text-sm text-red-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Kontaktinformasjon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Adresse" 
                    name="contact.address" 
                    placeholder="Gate, postnummer, by" 
                    required 
                  />
                  <FormInput 
                    label="Telefonnummer" 
                    name="contact.phone" 
                    type="tel" 
                    placeholder="+47 XXX XX XXX" 
                    required 
                  />
                  <FormInput 
                    label="E-post" 
                    name="contact.email" 
                    type="email" 
                    placeholder="kontakt@bedrift.no" 
                    required 
                  />
                  <FormInput 
                    label="Nettside" 
                    name="contact.website" 
                    placeholder="https://www.bedrift.no" 
                    required 
                  />
                </div>
                <div className="mt-4">
                  <FormTextArea 
                    label="Åpningstider" 
                    name="contact.openingHours" 
                    placeholder="F.eks: Man-fre: 09:00-17:00, Lør: Stengt, Søn: Stengt" 
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <SecondaryButton onClick={onBack} className="px-6">
                  <ArrowLeft size={18} className="mr-2" /> Tilbake
                </SecondaryButton>
                <GradientButton 
                  type="submit" 
                  disabled={!(isValid && dirty)}
                  className="px-8"
                >
                  Neste trinn <ArrowRight size={18} className="ml-2" />
                </GradientButton>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </motion.div>
  );
};

// Step 3: Services Step
const ServicesStep = ({ data, onUpdate, onNext, onBack }) => {
  // Set up validation schema based on partner type
  const getValidationSchema = () => {
    const baseSchema = {
      services: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required('Navn på tjeneste er påkrevd'),
          description: Yup.string()
        })
      ).min(1, 'Legg til minst én tjeneste'),
      expertise: Yup.array().of(
        Yup.object().shape({
          area: Yup.string().required('Kompetanseområde er påkrevd'),
          level: Yup.number().required('Ekspertisenivå er påkrevd').min(1).max(5)
        })
      ).min(1, 'Legg til minst ett kompetanseområde'),
      targetGroups: Yup.array().of(Yup.string()).min(1, 'Legg til minst én målgruppe')
    };

    // Add type-specific validation if needed
    switch (data.company?.type) {
      case 'bank':
        // Add bank-specific validation
        break;
      case 'insurance':
        // Add insurance-specific validation
        break;
      case 'contractor':
        // Add contractor-specific validation
        break;
    }

    return Yup.object().shape(baseSchema);
  };

  // Default services based on partner type
  const getDefaultServices = () => {
    switch (data.company?.type) {
      case 'bank':
        return [
          { name: 'Boliglån', description: '' },
          { name: 'Byggelån', description: '' }
        ];
      case 'insurance':
        return [
          { name: 'Boligforsikring', description: '' },
          { name: 'Innboforsikring', description: '' }
        ];
      case 'contractor':
        return [
          { name: 'Renovering', description: '' },
          { name: 'Nybygg', description: '' }
        ];
      default:
        return [{ name: '', description: '' }];
    }
  };

  // Default expertise areas based on partner type
  const getDefaultExpertise = () => {
    switch (data.company?.type) {
      case 'bank':
        return [
          { area: 'Boliglån for førstegangskjøpere', level: 3 },
          { area: 'Finansiering av nybygg', level: 3 }
        ];
      case 'insurance':
        return [
          { area: 'Boligforsikring', level: 3 },
          { area: 'Byggskadeforsikring', level: 3 }
        ];
      case 'contractor':
        return [
          { area: 'Renovering av eldre boliger', level: 3 },
          { area: 'Tilbygg og påbygg', level: 3 }
        ];
      default:
        return [{ area: '', level: 3 }];
    }
  };

  // Default target groups based on partner type
  const getDefaultTargetGroups = () => {
    switch (data.company?.type) {
      case 'bank':
        return ['Førstegangskjøpere', 'Boligeiere med oppgraderingsbehov'];
      case 'insurance':
        return ['Huseiere', 'Borettslag'];
      case 'contractor':
        return ['Privatpersoner', 'Små boligprosjekter'];
      default:
        return [''];
    }
  };

  // Get partner-type-specific title
  const getTypeTitle = () => {
    switch (data.company?.type) {
      case 'bank':
        return 'Bankens tjenester';
      case 'insurance':
        return 'Forsikringstjenester';
      case 'contractor':
        return 'Entreprenørtjenester';
      default:
        return 'Tjenester';
    }
  };

  const initialValues = {
    services: data.services || getDefaultServices(),
    expertise: data.expertise || getDefaultExpertise(),
    targetGroups: data.targetGroups || getDefaultTargetGroups(),
    uniquePoints: data.uniquePoints || ''
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">Tjenester og kompetanseområder</h2>
        <p className="text-blue-100 mb-6">
          Fortell oss mer om tjenestene {data.company?.name || 'din bedrift'} tilbyr og 
          hvilke områder dere har spesiell kompetanse innen.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema()}
          onSubmit={(values) => {
            onUpdate('services', values.services);
            onUpdate('expertise', values.expertise);
            onUpdate('targetGroups', values.targetGroups);
            onUpdate('uniquePoints', values.uniquePoints);
            onNext();
          }}
        >
          {({ values, isValid, dirty }) => (
            <Form className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">{getTypeTitle()}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Legg til de tjenestene din virksomhet tilbyr som er relevante for Eiendomsmuligheter-plattformen
                </p>
                
                <FieldArray name="services">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.services.map((service, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-white font-medium">Tjeneste {index + 1}</h4>
                            {values.services.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <Field
                              name={`services.${index}.name`}
                              placeholder="Tjenestenavn"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
                              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <ErrorMessage name={`services.${index}.name`} component="div" className="mt-1 text-sm text-red-400" />
                          </div>

                          <div>
                            <Field
                              as="textarea"
                              name={`services.${index}.description`}
                              placeholder="Kort beskrivelse av tjenesten (valgfritt)"
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
                              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => push({ name: '', description: '' })}
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                      >
                        <Plus size={16} className="mr-1" /> Legg til tjeneste
                      </button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="services" component="div" className="mt-1 text-sm text-red-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Ekspertiseområder</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Rangér din bedrifts ekspertise innen ulike områder (1-5, der 5 er høyest)
                </p>
                
                <FieldArray name="expertise">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.expertise.map((exp, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-grow">
                            <Field
                              name={`expertise.${index}.area`}
                              placeholder="Ekspertiseområde"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
                              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <ErrorMessage name={`expertise.${index}.area`} component="div" className="mt-1 text-sm text-red-400" />
                          </div>
                          
                          <div className="w-40">
                            <Field name={`expertise.${index}.level`}>
                              {({ field }) => (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-400">Nivå</span>
                                    <span className="text-xs text-white">{field.value}/5</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    {...field}
                                    className="w-full accent-blue-500"
                                  />
                                </div>
                              )}
                            </Field>
                          </div>
                          
                          {values.expertise.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => push({ area: '', level: 3 })}
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                      >
                        <Plus size={16} className="mr-1" /> Legg til ekspertiseområde
                      </button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="expertise" component="div" className="mt-1 text-sm text-red-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Målgrupper</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Hvilke kundegrupper betjener din bedrift primært?
                </p>
                
                <FieldArray name="targetGroups">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.targetGroups.map((group, index) => (
                        <div key={index} className="flex items-center">
                          <Field
                            name={`targetGroups.${index}`}
                            placeholder="Kundegruppe"
                            className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white 
                            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {values.targetGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="ml-2 p-2 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                      >
                        <Plus size={16} className="mr-1" /> Legg til målgruppe
                      </button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="targetGroups" component="div" className="mt-1 text-sm text-red-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Unike salgspoeng</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Hva gjør din bedrift unik i markedet? Hvorfor burde kunder velge dere?
                </p>
                <FormTextArea 
                  name="uniquePoints" 
                  placeholder="Beskriv hva som gjør din bedrift unik sammenlignet med konkurrentene" 
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <SecondaryButton onClick={onBack} className="px-6">
                  <ArrowLeft size={18} className="mr-2" /> Tilbake
                </SecondaryButton>
                <GradientButton 
                  type="submit" 
                  disabled={!(isValid && dirty)}
                  className="px-8"
                >
                  Neste trinn <ArrowRight size={18} className="ml-2" />
                </GradientButton>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </motion.div>
  );
};

// Step 4: Marketing Step
const MarketingStep = ({ data, onUpdate, onNext, onBack }) => {
  const [marketingImages, setMarketingImages] = useState(data.marketingImages || []);
  const [documents, setDocuments] = useState(data.documents || []);
  
  const handleAddImage = (file) => {
    if (file) {
      const newImages = [...marketingImages, file];
      setMarketingImages(newImages);
      onUpdate('marketingImages', newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...marketingImages];
    newImages.splice(index, 1);
    setMarketingImages(newImages);
    onUpdate('marketingImages', newImages);
  };

  const handleAddDocument = (file) => {
    if (file) {
      const newDocuments = [...documents, file];
      setDocuments(newDocuments);
      onUpdate('documents', newDocuments);
    }
  };

  const handleRemoveDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
    onUpdate('documents', newDocuments);
  };

  const validationSchema = Yup.object().shape({
    visibility: Yup.string().required('Velg synlighetsnivå'),
    agreementAccepted: Yup.boolean().oneOf([true], 'Du må godta partneravtalen for å fortsette')
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">Markedsføringsmateriale</h2>
        <p className="text-blue-100 mb-6">
          Last opp bilder og dokumenter som vil hjelpe med å markedsføre din bedrift til våre brukere.
        </p>

        <Formik
          initialValues={{
            visibility: data.visibility || 'standard',
            agreementAccepted: data.agreementAccepted || false
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onUpdate('visibility', values.visibility);
            onUpdate('agreementAccepted', values.agreementAccepted);
            onNext();
          }}
        >
          {({ values, isValid, dirty, setFieldValue }) => (
            <Form className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Bildegalleribilder</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Last opp bilder av prosjekter, lokaler, team eller andre visuelle elementer 
                  som representerer din bedrift.
                </p>
                
                {marketingImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {marketingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Marketing image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <FileUpload 
                  label="Legg til bilde" 
                  name="image" 
                  accept="image/*" 
                  onFileSelect={handleAddImage} 
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Dokumenter</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Last opp relevante dokumenter som brosjyrer, prisguider, eller produktinformasjon.
                </p>
                
                {documents.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <FileText size={24} className="text-gray-400 mr-3" />
                        <div className="flex-grow">
                          <p className="text-white text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-gray-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="p-1.5 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <FileUpload 
                  label="Legg til dokument" 
                  name="document" 
                  accept=".pdf,.doc,.docx,.ppt,.pptx" 
                  onFileSelect={handleAddDocument} 
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Synlighet på plattformen</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Velg hvordan din bedrift skal vises på Eiendomsmuligheter-plattformen.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="flex items-start p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                      <Field
                        type="radio"
                        name="visibility"
                        value="standard"
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-white font-medium block">Standard synlighet</span>
                        <span className="text-sm text-gray-400">
                          Din bedrift vises i partnerlisten og i relevante søkeresultater
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-start p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                      <Field
                        type="radio"
                        name="visibility"
                        value="featured"
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-white font-medium block">Fremhevet partner (Tilleggskostnad)</span>
                        <span className="text-sm text-gray-400">
                          Din bedrift fremheves i partnerlisten, søkeresultater, og vises på forsiden
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-start p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                      <Field
                        type="radio"
                        name="visibility"
                        value="premium"
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-white font-medium block">Premium partner (Tilleggskostnad)</span>
                        <span className="text-sm text-gray-400">
                          Din bedrift får topplassering i alle relevante seksjoner, dedikert banner, og 
                          eksklusiv markedsføring i nyhetsbrev
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                <ErrorMessage name="visibility" component="div" className="mt-1 text-sm text-red-400" />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Partneravtale</h3>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4 max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-white mb-2">Eiendomsmuligheter Partneravtale</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Dette er en avtale mellom Eiendomsmuligheter AS ("Plattformen") og den registrerte 
                    partnerbedriften ("Partneren").
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-gray-300 space-y-2">
                    <li>Partneren godtar å levere tjenester av høy kvalitet til brukere av Plattformen.</li>
                    <li>Partneren godtar å oppdatere sin profil med korrekt og oppdatert informasjon.</li>
                    <li>Partneren godtar betalingsmodellen som er kommunisert av Plattformen.</li>
                    <li>Plattformen forbeholder seg retten til å fjerne partnerprofiler som bryter med vilkårene.</li>
                    <li>Begge parter kan si opp avtalen med 30 dagers skriftlig varsel.</li>
                    <li>Partneren godtar at Eiendomsmuligheter bruker deres logo og bedriftsinformasjon i markedsføring.</li>
                  </ol>
                </div>
                
                <FormCheckbox 
                  name="agreementAccepted" 
                  label="Jeg har lest og godtar partneravtalen" 
                />
                <ErrorMessage name="agreementAccepted" component="div" className="mt-1 text-sm text-red-400" />
              </div>

              <div className="flex justify-between pt-4">
                <SecondaryButton onClick={onBack} className="px-6">
                  <ArrowLeft size={18} className="mr-2" /> Tilbake
                </SecondaryButton>
                <GradientButton 
                  type="submit" 
                  disabled={!(isValid && (dirty || documents.length > 0 || marketingImages.length > 0))}
                  className="px-8"
                >
                  Fullfør <Check size={18} className="ml-2" />
                </GradientButton>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </motion.div>
  );
};

// Completion Screen
const CompletionScreen = ({ data, onDashboard }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <Card className="text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Gratulerer! Oppsettet er fullført</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Takk for at du har fullført partneroppsettet for {data.company?.name || 'din bedrift'}. 
            Vi ser frem til å samarbeide med deg på Eiendomsmuligheter-plattformen.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 max-w-lg text-left">
            <h3 className="text-lg font-medium text-white mb-3">Neste steg:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-blue-500/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <Check size={16} className="text-blue-400" />
                </div>
                <span className="text-gray-300">
                  Vårt team vil gjennomgå din partnerprofil innen 1-2 virkedager
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <Check size={16} className="text-blue-400" />
                </div>
                <span className="text-gray-300">
                  Du vil motta en e-post når profilen er godkjent og publisert
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <Check size={16} className="text-blue-400" />
                </div>
                <span className="text-gray-300">
                  I mellomtiden kan du utforske partner-dashbordet og gjøre deg kjent med funksjonene
                </span>
              </li>
            </ul>
          </div>
          
          <GradientButton 
            onClick={onDashboard} 
            className="px-10"
          >
            Gå til partner-dashbordet
          </GradientButton>
        </div>
      </Card>
    </motion.div>
  );
};

export default function PartnerOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: {
      name: 'ExempelBank AS', // Prefilled for demo
      type: '',
      description: '',
      longDescription: '',
      logo: null,
      benefits: ['']
    },
    contact: {
      address: '',
      phone: '',
      email: '',
      website: '',
      openingHours: ''
    },
    services: [],
    expertise: [],
    targetGroups: [],
    uniquePoints: '',
    marketingImages: [],
    documents: [],
    visibility: 'standard',
    agreementAccepted: false
  });

  // Update form data
  const handleUpdate = (sectionKey, data) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...data
      }
    }));
  };

  // Go to dashboard (would navigate to dashboard in a real app)
  const goToDashboard = () => {
    alert('Navigating to partner dashboard (demo)');
    // In a real app, would use something like router.push('/partner/dashboard')
  };

  // Render current step
  const renderCurrentStep = () => {
    switch(step) {
      case 1:
        return <WelcomeStep 
          data={formData} 
          onUpdate={handleUpdate} 
          onNext={() => setStep(2)} 
        />;
      case 2:
        return <ProfileStep 
          data={formData} 
          onUpdate={handleUpdate} 
          onNext={() => setStep(3)} 
          onBack={() => setStep(1)} 
        />;
      case 3:
        return <ServicesStep 
          data={formData} 
          onUpdate={handleUpdate} 
          onNext={() => setStep(4)} 
          onBack={() => setStep(2)} 
        />;
      case 4:
        return <MarketingStep 
          data={formData} 
          onUpdate={handleUpdate} 
          onNext={() => setStep(5)} 
          onBack={() => setStep(3)} 
        />;
      case 5:
        return <CompletionScreen 
          data={formData} 
          onDashboard={goToDashboard} 
        />;
      default:
        return <WelcomeStep 
          data={formData} 
          onUpdate={handleUpdate} 
          onNext={() => setStep(2)} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with progress indicator (only show for steps 1-4) */}
        {step < 5 && (
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white text-center mb-6">Partneroppsett</h1>
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map(num => (
                <div 
                  key={num}
                  className={`w-1/4 h-2 mx-1 rounded-full ${
                    step >= num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Velkommen</span>
              <span>Profil</span>
              <span>Tjenester</span>
              <span>Avslutning</span>
            </div>
          </div>
        )}
        
        {/* Main content with animated steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}