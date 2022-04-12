import { useState } from "react"

type FieldsListProps = {
    name: string,
    type: "text" | "url",
    data: Array<any>,
    remove: Function,
    add: Function,
    change: Function
}

const FieldsList = ({ name, type, data, remove, add, change }: FieldsListProps) => {

    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if(value !== "") {
            add(value);
            setValue("");
        }
    }

    return (
        <>
            {data.map((elt, i) =>
                <div key={`${name}-${i}`}>
                    <input type={type} value={elt} onChange={e => change(i, e.target.value)}/>
                    <input type="button" value="-" onClick={e => remove(i)} />
                </div>
            )}
            <input type={type} onChange={e => setValue(e.target.value)} value={value} />
            <input type="button" value="+" onClick={handleSubmit} />
        </>
    )
}

export { FieldsList }