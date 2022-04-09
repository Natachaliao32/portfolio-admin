import { useReducer, useState } from "react";
import { projectType, propertyType } from "../types";
import { setProperty } from "../utility";

type CreateProjectProps = {
    categories: propertyType[],
    tools: propertyType[]
}

const CreateProject = ({ categories, tools }: CreateProjectProps) => {

    const [project, setProject] = useState<projectType>({
        name: "",
        date: 0,
        categories: [],
        cover: "",
        contributors: [""],
        links: [""],
        tools: [],
        description: "",
        files: [""]
    });

    // Set a value
    const set = (key: "name" | "date" | "cover" | "description", value: any) => {
        const cpy = {...project};
        setProperty(cpy, key, value);
        setProject(cpy);
    }

    // Change value 
    const change = (key: "categories" | "contributors" | "links" | "tools" | "files", value: any, index: number) => {
        const cpy = {...project};
        cpy[key][index] = value;
        setProject(cpy);
    }

    // Push value
    // Push empty value
    const add = (key: "categories" | "contributors" | "links" | "tools" | "files", value: any) => {
        const cpy = {...project};
        cpy[key].push(value);
        setProject(cpy);
    }

    // Remove by name
    // Remove by index

    const removeByValue = (key: "categories" | "contributors" | "links" | "tools" | "files", value: any) => {
        const cpy = {...project};
        let index = cpy[key].indexOf(value);
        if(index !== -1) cpy[key].splice(index, 1);
        setProject(cpy);
    }

    const removeByIndex = (key: "categories" | "contributors" | "links" | "tools" | "files", index: number) => {
        const cpy = {...project};
        cpy[key].splice(index, 1);
        setProject(cpy);
        console.log("index : ", index);
        console.log("array : ", cpy[key]);
    }

    const reducerProject = (project: projectType, action: { type: "set" | "add" | "remove" | "change", payload: { key: keyof projectType, value?: any, index?: number } }) => {
        const {key, value} = action.payload;

        const isArrayProperty = key === "categories" || key === "contributors" || key === "links" || key === "tools";

        switch (action.type) {
            case "set":
                if (isArrayProperty) throw new Error("For type set, payload.key should be name or date or cover or description.");
                setProperty(project, key, value);
                return project;
            case "add":
                if (!isArrayProperty) throw new Error("For type add, payload.key should be categories or contributors or links or tools.");
                if(project[key as "categories" | "contributors" | "links" | "tools"].includes(value)) return project;
                project[key as "categories" | "contributors" | "links" | "tools"].push(value);
                return project;
            case "remove":
                if (!isArrayProperty) throw new Error("For type remove, payload.key should be categories or contributors or links or tools.");
                let index;
                if(value !== undefined) index = project[key as "categories" | "contributors" | "links" | "tools"].indexOf(value);
                else if(action.payload.index !== undefined) index = action.payload.index;
                else throw new Error("Define either payload.value or payload.index");
                if(index !== -1) project[key as "categories" | "contributors" | "links" | "tools"].splice(index, 1);
                return project;
            case "change":
                if (key !== "contributors" && key !=="links") throw new Error("For type change, payload.key should be links or contributors.");
                if(action.payload.index === undefined) throw new Error("For type change, payload must have an index.");
                project[key as "contributors" | "links"][action.payload.index] = value;
                return project;
            default:
                throw new Error("type should be set, add or remove");
        }
    }

    // const [project, dispatchProject] = useReducer(reducerProject, {
    //     name: "",
    //     date: 0,
    //     categories: [],
    //     cover: "",
    //     contributors: [""],
    //     links: [""],
    //     tools: [],
    //     description: "",
    // });

    const handleCheck = (e: React.ChangeEvent, key: "categories" | "contributors" | "links" | "tools") => {
        const target = e.target as HTMLInputElement;
        if(target.checked) add(key, target.name);
        else removeByValue(key, target.name);
    }

    console.log(project);

    return (
        <form action="http://localhost:3000/projects" method="POST">
            <div>
                <label htmlFor="name">Nom du projet</label>
                <input type="text" name="name" id="name" onChange={e => set("name", e.target.value)} />
            </div>

            <div>
                <label htmlFor="date">Date</label>
                <input type="month" name="date" id="date" onChange={e => set("date", e.target.value)} />
            </div>

            <div>
                <label htmlFor="categories">Catégories</label>
                {categories.map((category, i) => <div key={`category-${i}`}>
                    <label htmlFor={category.name}>{category.name}</label>
                    <input type="checkbox" name={category.name} id={category.name} onChange={e => handleCheck(e, "categories")} />
                </div>)}
            </div>

            <div>
                <label htmlFor="cover">Image de couverture</label>
                <input type="file" name="cover" id="cover" accept="image/png, image/jpeg" onChange={e => console.log(e.target.value)} />
            </div>

            <div>
                <label htmlFor="contributors">Collaborateurs</label>
                {project.contributors.map((contributor, i) => <div key={`contributor-${i}`}>
                    <input type="text" onChange={e => change("contributors", e.target.value, i)} value={contributor} />
                    <input type="button" value="-" onClick={e => removeByIndex("contributors", i)}/>
                </div>)}
                <input type="button" value="+" onClick={e => add("contributors", "")}/>
            </div>

            <div>
                <label htmlFor="links">Liens</label>
                {project.links.map((link, i) => <div key={`link-{$i}`}>
                    <input type="url" onChange={e => change("links", e.target.value, i)} value={link} />
                    <input type="button" value="-" onClick={e => removeByIndex("links", i)}/>
                </div>)}
                <input type="button" value="+" onClick={e => add("links", "")}/>
            </div>

            <div>
                <label htmlFor="tools">Outils</label>
                {tools.map((tool, i) => <div key={`tool-${i}`}>
                    <label htmlFor={tool.name}>{tool.name}</label>
                    <input type="checkbox" name={tool.name} id={tool.name} onChange={e => handleCheck(e, "tools")} />
                </div>)}
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" cols={30} rows={10} onChange={e => set("description", e.target.value)}></textarea>
            </div>

            <div>
                <label htmlFor="files">Fichiers</label>
                {project.links.map((file, i) => <div key={`file-{$i}`}>
                    <input type="url" onChange={e => change("files", e.target.value, i)} value={file} />
                    <input type="button" value="-" onClick={e => removeByIndex("files", i)}/>
                </div>)}
                <input type="button" value="+" onClick={e => add("files", "")}/>
            </div>

            <input type="submit" />

        </form>
    );
}

export { CreateProject }