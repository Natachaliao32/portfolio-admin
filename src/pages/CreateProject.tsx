import { useEffect, useReducer, useState } from "react";
import { FieldsList } from "../components/FieldsList";
import { FilePreview } from "../components/FilePreview";
import { useFetch } from "../hooks/useFetch";
import { projectType, propertyType, fileType } from "../types";
import { setProperty } from "../utility";

type CreateProjectProps = {
    categories: propertyType[],
    tools: propertyType[]
}

type projectAction =
| { type: 'set-property'; payload: {key: keyof projectType; value: any } }
| { type: 'add-to-property'; payload: {key: "categories" | "contributors" | "links" | "tools" | "files"; value: any } }
| { type: 'remove-from-property-by-value'; payload: {key: "categories" | "contributors" | "links" | "tools"; value: any } }
| { type: 'remove-from-property-by-index'; payload: {key: "categories" | "contributors" | "links" | "tools" | "files"; index: number } }
| { type: 'add-to-files'; payload: fileType }
| { type: 'change-value-at', payload: {key: "categories" | "contributors" | "links" | "tools" | "files", index: number, value: any}}
| { type: 'reset' }
| { type: 'finish-update'}

const CreateProject = ({ categories, tools }: CreateProjectProps) => {

    const fetchData = useFetch();

    const [files, setFiles] = useState<Array<File>>([]);

    const [cover, setCover ] = useState<File>();

    const [submit, setSubmit] = useState(false);

    const removeFile = (index: number) => {
        if (files) {
            const cpy = [...files];
            cpy.splice(index, 1);
            setFiles(cpy);
        }
    }

    const initialProject = {
        name: "",
        date: 0,
        categories: [],
        cover: "",
        contributors: [],
        links: [],
        tools: [],
        description: "",
        files: []
    };

    const reducer = (project: projectType, action: projectAction): projectType => {     
        const cpy = { ...project };
        
        switch (action.type) {
            
            case "set-property":
                setProperty(cpy, action.payload.key, action.payload.value)
                return cpy;

            case "add-to-property":
                cpy[action.payload.key].push(action.payload.value);
                return cpy;

                case "remove-from-property-by-value":
                let index = cpy[action.payload.key].indexOf(action.payload.value);
                if (index !== -1) cpy[action.payload.key].splice(index, 1);
                return cpy;

            case "remove-from-property-by-index":
                cpy[action.payload.key].splice(action.payload.index, 1);
                return cpy;

            case "add-to-files":
                cpy.files.push({ path: action.payload.path, media: action.payload.media, external: action.payload.external });
                return cpy;
            
            case "change-value-at":
                if(action.payload.value === "") {
                    cpy[action.payload.key].splice(action.payload.index, 1);
                } else {
                    cpy[action.payload.key][action.payload.index] = action.payload.value;
                }
                return cpy;

            case "reset":
                return initialProject;

            case "finish-update":
                console.log(project);
                return project;
            default:
                throw new Error("Undefined action.type");
        }
    }
    
    const [project, dispatch] = useReducer(reducer, initialProject);

    const handleCheck = (e: React.ChangeEvent, key: "categories" | "contributors" | "links" | "tools") => {
        const target = e.target as HTMLInputElement;
        if (target.checked) dispatch({type: "add-to-property", payload: {key, value: target.name}});
        else dispatch({type: "remove-from-property-by-value", payload: {key, value: target.name}});
    }

    const reset = () => {
        dispatch({type: "reset"});
        setCover(undefined);
        setFiles([]);
    }

    const handleSubmit = async () => {

        // Send files to be stored in backend

        const formData = new FormData();

        formData.append("projectName", project.name);

        if(cover) {
            formData.append("cover", cover);
        }

        if (files.length > 0) {    
            for (let i = 0; i < files.length; i++) {
                formData.append("array", files[i]);
            }
        }
        
        const data = await fetchData("http://localhost:3000/projects/upload", "POST", formData);
        
        // Push uploaded files to project
        
        dispatch({type: "set-property", payload: {key: "cover", value: data.cover.path}});
        
        data.files.forEach((file: {path: string, media: "picture" | "video"}) => {
            dispatch({type: "add-to-files", payload: {path: file.path, media: "picture", external: false}});
        })

        setSubmit(true);
        // reset();
    }

    useEffect(() => {
        if(submit) {
            fetchData("http://localhost:3000/projects", "POST", project)
            .then(response => console.log(response))
            setSubmit(false);
        }
    }, [submit])


    return (
        <form action="http://localhost:3000/projects" method="POST">
            <div>
                <label htmlFor="name">Nom du projet</label>
                <input type="text" name="name" id="name" 
                    onChange={e => dispatch({type: "set-property", payload: {key: "name", value: e.target.value}})} 
                />
            </div>

            <div>
                <label htmlFor="date">Date</label>
                <input type="number" name="date" id="date" 
                    onChange={e => dispatch({type: "set-property", payload: {key: "date", value: e.target.value}})} 
                />
            </div>

            <div>
                <label htmlFor="categories">Catégories</label>
                {categories.map((category, i) =>
                    <div key={`category-${i}`}>
                        <label htmlFor={category.name}>{category.name}</label>
                        <input type="checkbox" name={category.name} id={category.name} onChange={e => handleCheck(e, "categories")} />
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="cover">Image de couverture</label>
                <input type="file" name="cover" id="cover" accept="image/png, image/jpeg"   
                    onChange={e => e.target.files && setCover(e.target.files[0])} 
                />
                {cover && <FilePreview file={cover}/>}
            </div>

            <div>
                <label htmlFor="contributors">Collaborateurs</label>
                <FieldsList
                    name="contributors"
                    type="text"
                    data={project.contributors}
                    add={(value: any) => dispatch({type:"add-to-property", payload: {key: "contributors", value}})}
                    remove={(index: number) => dispatch({type:"remove-from-property-by-index", payload: {key: "contributors", index}})}
                    change={(index: number, value: any) => dispatch({type: "change-value-at", payload: {key: "contributors", index, value}})}
                />
            </div>

            <div>
                <label htmlFor="links">Liens</label>
                <FieldsList
                    name="links"
                    type="url"
                    data={project.links}
                    add={(value: any) => dispatch({type:"add-to-property", payload: {key: "links", value}})}
                    remove={(index: number) => dispatch({type:"remove-from-property-by-index", payload: {key: "links", index}})}
                    change={(index: number, value: any) => dispatch({type: "change-value-at", payload: {key: "links", index, value}})}
                />
            </div>

            <div>
                <label htmlFor="tools">Outils</label>
                {tools.map((tool, i) => 
                    <div key={`tool-${i}`}>
                        <label htmlFor={tool.name}>{tool.name}</label>
                        <input type="checkbox" name={tool.name} id={tool.name} onChange={e => handleCheck(e, "tools")} />
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" cols={30} rows={10} 
                    onChange={e => dispatch({type: "set-property", payload: {key: "description", value: e.target.value}})}>
                </textarea>
            </div>

            <div>
                <label htmlFor="files">Importer des images</label>
                <input type="file" multiple onChange={e => e.target.files && setFiles([...e.target.files])} />
                {files && [...files].map((file, i) => 
                    <div key={`upload-${i}`}>
                        <FilePreview file={file} key={`file-preview-${i}`} />
                        <input type="button" value="-" onClick={e => removeFile(i)} />
                    </div>
                )}
                <label htmlFor="files">Lier des vidéos</label>
                <FieldsList
                    name="files"
                    type="url"
                    data={project.files.filter(file => file.external).map(file => file.path)}
                    add={(path: string) => dispatch({type:"add-to-files", payload: {path, media: "video", external: true}})}
                    remove={(index: number) => dispatch({type:"remove-from-property-by-index", payload: {key: "files", index}})}
                    change={(index: number, value: any) => dispatch({type: "change-value-at", payload: {key: "files", index, value}})}
                />
            </div>

            <input type="button" value="Valider" onClick={e => handleSubmit()} />

        </form>
    );
}

export { CreateProject }