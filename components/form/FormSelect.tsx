import { ReactNode } from "react";

export default function FormSelect({
  fieldName,
  placeholder,
  values,
  required,
  multiple,
  children,
}: {
  fieldName: string;
  placeholder?: string;
  values: Record<string, string | number>;
  required?: boolean;
  multiple?: boolean;
  children: ReactNode;
}) {
  let selectClasses =
    "w-full px-4 py-2 bg-gray-100 rounded outline-1 outline-gray-200";
  if (multiple) selectClasses += " h-64";

  return (
    <>
      <div className="md:my-5 my-4 w-full px-3 sm:px-4">
        <label className="text-lg font-semibold text-left">
          {children}
          {required && <p className="text-red-500 inline">*</p>}
        </label>{" "}
        <br />
        <select
          className={selectClasses}
          name={fieldName}
          multiple={multiple}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {Object.entries(values).map(
            (v: [string, string | number]): ReactNode => (
              <option value={v[1]} key={v[1]}>
                {v[0]}
              </option>
            )
          )}
        </select>
      </div>
    </>
  );
}
