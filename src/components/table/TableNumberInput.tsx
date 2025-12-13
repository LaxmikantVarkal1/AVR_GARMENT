import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface TableNumberInputProps {
    value: string | number;
    onBlur: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function TableNumberInput({
    value,
    onBlur,
    disabled = false,
    placeholder = "0",
    className,
}: TableNumberInputProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onBlur(localValue.toString());
        }
    };

    if (disabled) {
        return (
            <div className={`py-2 px-3 text-sm font-medium ${className}`}>
                {value || "0"}
            </div>
        );
    }

    return (
        <Input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={`h-8 w-full ${className}`}
        />
    );
}
