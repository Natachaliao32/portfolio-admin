type propertyType = {
    _id: number,
    name: string
}

type fileType = {
    path: string,
    media: "picture" | "video",
    external: boolean
}

type projectType = {
    name: string,
    date: number,
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