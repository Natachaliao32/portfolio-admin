import { useEffect, useState } from "react";

type FilePreviewProps = {
    file: File
}

const FilePreview = ({ file } : FilePreviewProps) => {

    const [url, setURL] = useState("");

    useEffect(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);   
        reader.addEventListener("load", () => {
            if(reader.result) {
                setURL(reader.result as string);
            }
        }, false);
    })

    return (
        <img src={url} alt="file-preview" />
    )
}

export { FilePreview }