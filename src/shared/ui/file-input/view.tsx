import { forwardRef, useId } from 'react';

interface FileInputProps {
  onChange: (file: File) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ onChange }, ref) => {
    const id = useId();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onChange(file);
      }

      event.target.value = '';
      event.target.files = null;
    };

    return (
      <input
        id={id}
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    );
  },
);
FileInput.displayName = 'UI/FileInput';
