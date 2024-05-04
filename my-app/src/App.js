import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from "./components/ui/input";
import { Loader2 } from "lucide-react";
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputInvalid, setInputInvalid] = useState(false);
  const [recommendedAsanas, setRecommendedAsanas] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null); // State to hold debounce timeout

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') {
      setInputInvalid(true);
      return;
    }
    setRecommendedAsanas([]);
    setIsLoading(true);
    setError('');
    setInputInvalid(false);

    // Clear the previous debounce timeout, if any
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new debounce timeout of 500ms
    const timeout = setTimeout(async () => {
      const Diseases = { content };

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(Diseases)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log(responseData)
        const capitalizedAsanas = responseData["recommended_asans"].map(asana => capitalizeFirstLetter(asana));
        setRecommendedAsanas(capitalizedAsanas);
        setContent('');
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred, please try again later');
      } finally {
        setIsLoading(false);
      }
    }, 500);

    // Store the timeout reference in state
    setDebounceTimeout(timeout);
  };

  // Clear the debounce timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
  };

  return (
    <div className="flex flex-col p-10 pt-4 gap-3 " >
      <div className="md:text-6xl text-5xl self-center pb-7 md:pb-10 font-sans">
        Asana Suggester
      </div>
      <form className="flex gap-4 self-center" onSubmit={handleSubmit}>
        <Input 
          type="text"
          placeholder="Enter Disease"
          value={content}
          onChange={e => setContent(e.target.value)}
          className={`${inputInvalid ? 'border-red-500' : ''} md:text-2xl text-xl p-1 pl-2`}
  
        />
        <Button
          variant="secondary"
          type="submit"
          className="hover:border-solid hover:border-2 hover:border-white ease-in-out duration-300 hover:scale-105"
        >
          Submit
        </Button>
      </form>
      {inputInvalid && (
        <p className=" text-xl   text-red-500">Please enter the disease name</p>
      )}
      {recommendedAsanas.length > 0 && (
        <div className="md:text-3xl text-2xl md:pt-4  pt-2 self-center pr-20">
          <p>Recommended Asanas:</p>
          <ul className="list-disc pl-5">
            {recommendedAsanas.map((asana, index) => (
              <li key={index}>{asana}</li>
            ))}
          </ul>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center self-center pr-10 pt-5 text-3xl">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Please wait...</span>
        </div>
      )}
      {error && 
        <p className="text-red-500 ml-2 text-2xl">{error}</p>
      }
    </div>
  );
}

export default App;
