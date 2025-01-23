import React, { useState, useRef } from "react";
import Megaphone from '@leafygreen-ui/icon/dist/Megaphone';
import Stop from '@leafygreen-ui/icon/dist/Stop';
import IconButton from '@leafygreen-ui/icon-button';
import { useMarkers } from '../context/Markers';


const SpeechToText = ({ onSpeechResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [resultString, setResultString] = useState('');
  const {llmResponse} = useMarkers(''); 

  const recognitionRef = useRef(null);

  const handleSpeechRecognitionResult = (event) => {
    let result = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      result += event.results[i][0].transcript;
    }
    setResultString(prevResultString => prevResultString + ' ' + result);
    onSpeechResult(resultString + ' ' + result);
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    } else {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 10;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        handleSpeechRecognitionResult(event);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start(); 
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  return (
    <IconButton  
      onClick={toggleSpeechRecognition} aria-label="Some Menu"
      style={{margin:'3px 5px'}} disabled={llmResponse !== ''}>
       {isRecording ? <Stop /> : <Megaphone />}
    </IconButton> 
  );
};

export default SpeechToText;
