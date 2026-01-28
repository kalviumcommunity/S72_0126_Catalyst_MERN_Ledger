"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

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
    reset();
  };

  return (
    <main className="min-h-screen bg-theme flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme mb-2">Contact Us</h1>
          <p className="text-secondary text-sm">We&apos;d love to hear from you</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-theme rounded-2xl p-8 space-y-4"
        >
          <div>
            <label className="block text-sm text-secondary mb-1.5">Name</label>
            <input
              {...register("name")}
              placeholder="Your name"
              className={`w-full bg-input border rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none transition-colors ${
                errors.name ? "border-red-500" : "border-theme focus:border-accent"
              }`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={`w-full bg-input border rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none transition-colors ${
                errors.email ? "border-red-500" : "border-theme focus:border-accent"
              }`}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1.5">Message</label>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Your message..."
              className={`w-full bg-input border rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none transition-colors resize-none ${
                errors.message ? "border-red-500" : "border-theme focus:border-accent"
              }`}
            />
            {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
