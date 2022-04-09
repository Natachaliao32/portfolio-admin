import { useEffect, useState } from 'react';
import './App.css';
import { useFetch } from './hooks/useFetch';
import { CreateProperty } from './pages/CreateProperty';
import { CreateProject } from './pages/CreateProject';
import { propertyType } from './types';

function App() {

  const [categories, setCategories] = useState<propertyType[]>([]);
  const [tools, setTools] = useState<propertyType[]>([]);

  const fetchData = useFetch();

  const updateCategories = async () => {
    const data = await fetchData("http://localhost:3000/categories", "GET");
    setCategories(data);
  }

  const updateTools = async () => {
    const data = await fetchData("http://localhost:3000/tools", "GET");
    setTools(data);
  }

  useEffect(() => {
    updateCategories();
    updateTools();
  }, [])


  return (
    <div className="App">
      {/* <h1>Catégories</h1>
      <CreateProperty url="http://localhost:3000/categories/" items={categories} updateItems={updateCategories} />
      <h1>Outils</h1>
      <CreateProperty url="http://localhost:3000/tools/" items={tools} updateItems={updateTools} />
      <h1>Projet</h1> */}
      <CreateProject categories={categories} tools={tools} />
    </div>
  );
}

export default App;
