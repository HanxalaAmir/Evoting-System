import React from "react";

const Input = ({
  label,
  type = "text",
  placeholder,
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-500 transition-colors" />
          </div>
        )}

        <input
          type={type}
          className={`
            w-full bg-slate-900/50 text-white placeholder-slate-500 
            border rounded-lg py-2.5 
            ${Icon ? "pl-10 pr-4" : "px-4"} 
            ${
              error
                ? "border-red-500 focus:ring-red-500/30"
                : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30"
            }
            focus:outline-none focus:ring-4 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          placeholder={placeholder}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
