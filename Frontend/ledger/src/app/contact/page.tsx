"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Derive TypeScript types from schema
type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    console.log("Contact Form Submitted:", data);
    alert("Message Sent Successfully!");
    reset(); // Reset form after successful submission
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Contact Us
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 border border-gray-200 rounded-lg shadow-md"
        >
          <FormInput
            label="Name"
            name="name"
            register={register}
            error={errors.name}
            placeholder="Enter your name"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="your.email@example.com"
          />

          <div className="mb-3">
            <label htmlFor="message" className="block mb-1 font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows={5}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              placeholder="Enter your message (at least 10 characters)"
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 resize-vertical ${
                errors.message
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.message && (
              <p id="message-error" className="text-red-500 text-sm mt-1" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white px-4 py-2 mt-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">📋 Form Features:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Reusable FormInput component for name and email</li>
            <li>✓ Custom textarea with validation for message</li>
            <li>✓ Schema-based validation using Zod</li>
            <li>✓ Accessibility attributes (aria-invalid, aria-describedby)</li>
            <li>✓ Form reset after successful submission</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
