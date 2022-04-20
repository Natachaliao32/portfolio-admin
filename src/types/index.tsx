type propertyType = {
    _id: number,
    name: string
}

type fileType = {
    path: string,
    media: "image" | "video",
    external: boolean,
}

type projectType = {
    _id?: string,
    name: string,
    date: string,
    categories: propertyType[],
    cover: string,
    contributors: string[],
    links: string[],
    tools: propertyType[],
    description: string,
    files: fileType[]
}

type projectPropertyType = "name" | "date" | "categories" | "cover" | "contributors" | "links" | "tools" | "description" | "files";

export type { propertyType, projectType, projectPropertyType, fileType }