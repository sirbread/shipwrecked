"use client";

import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import countries from "@/types/countries";
import { save, FormSave } from "./actions";
import { useActionState, useEffect, useState, startTransition } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import Toast from "@/components/common/Toast";
import Link from "next/link";

// Client Side Registration Form
//
// If hasSession is true, hide the email/log in with slack option
export default function Form({ hasSession }: { hasSession?: boolean }) {
  const [state, formAction, pending] = useActionState(save, {
    errors: undefined,
    data: undefined,
    valid: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('error');
  const [formData, setFormData] = useState({
    "First Name": "",
    "Last Name": "",
    "Email": "",
    "Birthday": ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update toast when state changes
  useEffect(() => {
    if (state.valid) {
      console.log('Form submission successful:', formData);
      setToastType('success');
      setToastMessage("RSVP submitted successfully!");
      // Clear form data on success
      setFormData({
        "First Name": "",
        "Last Name": "",
        "Email": "",
        "Birthday": ""
      });
      setIsSubmitting(false);
    } else if (state.errors) {
      console.log('Form submission failed:', state.errors);
      setToastType('error');
      setToastMessage("Ooops - something went wrong.  Please try again later!");
      setIsSubmitting(false);
    }
  }, [state]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) {
      console.log('Prevented duplicate submission attempt');
      return;
    }
    
    console.log('Starting form submission:', formData);
    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    try {
      startTransition(() => {
        formAction(data);
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setToastType('error');
      setToastMessage("Ooops - something went wrong.  Please try again later!");
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <>
      {toastMessage && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <div className="text-dark-brown w-full max-w-4xl mb-1">
        <h1 className="text-2xl md:text-6xl font-bold mb-1 md:mb-4">
          RSVP for Shipwrecked!
        </h1>

        <form className="flex flex-col justify-center" onSubmit={handleSubmit}>
          <div className="lg:flex justify-center gap-1 md:gap-2">
            <FormInput
              fieldName="First Name"
              state={state}
              placeholder="Prophet"
              required
              value={formData["First Name"]}
              onChange={(e) => handleInputChange("First Name", e.target.value)}
            >
              First Name
            </FormInput>
            <FormInput
              fieldName="Last Name"
              state={state}
              placeholder="Orpheus"
              required
              value={formData["Last Name"]}
              onChange={(e) => handleInputChange("Last Name", e.target.value)}
            >
              Last Name
            </FormInput>
          </div>

          <div className="lg:flex justify-center gap-1 md:gap-2 md:mt-auto mt-[-10]">
            <FormInput
              fieldName="Email"
              state={state}
              placeholder="orpheus@hackclub.com"
              required
              value={formData["Email"]}
              onChange={(e) => handleInputChange("Email", e.target.value)}
            >
              Email
            </FormInput>
            <FormInput
              fieldName="Birthday"
              type="date"
              state={state}
              placeholder=""
              required
              value={formData["Birthday"]}
              onChange={(e) => handleInputChange("Birthday", e.target.value)}
            >
              Birthday
            </FormInput>
          </div>

          <div className="flex justify-center mt-0 md:mt-2 pt-1 md:pt-5">
            <button
              className="py-1 md:py-2 md:px-4 px-2 uppercase disabled:bg-dark-blue/20 bg-dark-blue/60 text-sand border border-sand whitespace-nowrap text-xs md:text-base transition hover:not-disabled:border-yellow backdrop-blur-sm rounded-full cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
              type="submit"
            >
              <span className="flex items-center gap-1 flex-nowrap">
                {isSubmitting ? "Submitting..." : "Submit"}
                <Image
                  src="/mark-check.svg"
                  width={12}
                  height={12}
                  alt="next"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
