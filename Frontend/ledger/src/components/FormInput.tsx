import { FieldValues, UseFormRegister, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  register: UseFormRegister<FieldValues>;
  name: string;
  error?: FieldError;
  placeholder?: string;
}

export default function FormInput({
  label,
  type = "text",
  register,
  name,
  error,
  placeholder,
}: FormInputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        placeholder={placeholder}
        className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && (
        <p id={`${name}-error`} className="text-red-500 text-sm mt-1" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
