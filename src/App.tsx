import "./App.css";
import Row from "./Row";
import clipNamesByType, { ClipType } from "./clipNamesByType";
import processFiles from "./processFiles";
import { ChangeEventHandler, useRef, useState } from "react";

const App = () => {
  // Downloaded file name
  const [name, setName] = useState("clip");
  // Auto-level flag
  const [autoLevel, setAutoLevel] = useState(false);

  // Refs to file inputs
  const refs = {
    spanishPhrase: useRef<HTMLInputElement>(null),
    englishPhrase: useRef<HTMLInputElement>(null),
    spanishPhraseSlowedDown: useRef<HTMLInputElement>(null),
    example1: useRef<HTMLInputElement>(null),
    example2: useRef<HTMLInputElement>(null),
    example3: useRef<HTMLInputElement>(null),
  };

  const getURLsAndProcess = () => {
    const urls: Record<string, string> = {};

    // Get URLs for each uploaded clip
    for (const [key, ref] of Object.entries(refs)) {
      const files = ref.current!.files;

      if (files === null || files.length === 0) {
        alert(`Missing ${clipNamesByType[key as ClipType]}`);
        return;
      }

      const file = files[0];
      const url = URL.createObjectURL(file);

      urls[key] = url;
    }

    // Pass off file name and urls
    processFiles({
      autoLevel,
      name,
      urls,
    });
  };

  // Toggle auto-level
  const toggleAutoLevel: ChangeEventHandler<HTMLInputElement> = (event) => {
    setAutoLevel(event.target.checked);
  };

  return (
    <div className="App">
      <h2>The Clip Collider</h2>

      {/* Downloaded file name */}
      <Row name="Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Row>

      {/* Uploaded files */}
      {Object.entries(clipNamesByType).map(([type, name], index) => {
        if (!(type in refs)) {
          throw Error(`Missing ref for ${type}`);
        }

        return (
          <Row key={index} name={name}>
            <input ref={refs[type as ClipType]} type="file" />
          </Row>
        );
      })}

      {/* Auto-level toggle */}
      <Row name="">
        <input type="checkbox" onInput={toggleAutoLevel} /> Auto-level
      </Row>

      {/* Collide button */}
      <Row name="">
        <button onPointerDown={getURLsAndProcess}>Collide</button>
      </Row>
    </div>
  );
};

export default App;
