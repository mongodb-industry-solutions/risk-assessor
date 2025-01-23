// BusinessPlan.js
import React, {useEffect,  useState, useRef } from 'react';
import TextArea from '@leafygreen-ui/text-area';
import Button from '@leafygreen-ui/button';
import { useMarkers } from '../context/Markers';
import SpeechToText from './SpeechToText'; 


function BusinessPlan() {
  const {markers, address,llmResponse, setLlmResponse, setLoading} = useMarkers(''); 
  const [value, setValue] = useState('');

  const handleSpeechResult = (result) => {
    setValue(value + ' ' + result);
  };

  const groupFloodsByDistance = (floods) => {
    const groupedFloods = {
      lessThan5km: {},
      over5km: {},
    };
  
    floods.forEach(flood => {
      if (!flood.year || !flood.distance) return;
      const year = flood.year;
  
      if (flood.distance < 5000) {
        groupedFloods.lessThan5km[year] = (groupedFloods.lessThan5km[year] || 0) + 1;
      } else {
        groupedFloods.over5km[year] = (groupedFloods.over5km[year] || 0) + 1;
      }
    });
  
    let resultText = '';
    for (const [year, count] of Object.entries(groupedFloods.lessThan5km)) {
      resultText += `In ${year}, there were ${count} floods less than 5km away.\n`;
    }
    for (const [year, count] of Object.entries(groupedFloods.over5km)) {
      resultText += `In ${year}, there were ${count} floods over 5km away.\n`;
    }
  
    return resultText;
  };

  const sendPromptToFireworks = async (prompt) => {
    const response = await fetch(`https://api.fireworks.ai/inference/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_FIREWORKS_API_KEY}`
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3-70b-instruct",
        max_tokens: 3072,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 1,
        temperature: 0.1,
        messages:[{ content: prompt, role: "user"}]
        }),
    });
  
    const data = await response.json();
    console.log('data:', data);
    //setLlmResponse(data.choices[0].message.content);
    setLoading(false);
    return data.choices[0].message.content;
  };

  const handleSubmit = async () => {
    setLoading(true); 
    const groupedFloods = groupFloodsByDistance(markers);
    if (value.length < 10) {
      window.alert('Please expand on your business idea!');
      return;
    }
    if (address == undefined || address == '') {
      window.alert('Please imput an adress on the map');
      return;
    }
    //console.log('groupedFloods:', groupedFloods);
    //console.log('Address:',address);
    const prompt = `
    Instructions:
    - You will be stepping in the shoes of a risk assessor for a business loan company in the year is 2021. Try to use relative terms like "last year" or "next year" and not specific dates. 
    - Do not provide advice, rather assess the risks and potential of the business. Therefore, don't recommend getting flood insurance, rather make a note that it was not in the business description.
    - Please provide the cost and revenue calculation and projection.
    - Analyse local competition, demographics, foot traffic.
    - Above all, analyse the impact of any environmental risks represented by the flood data provided. Describe the context given to you in the inputs as this is not information that the end user has. However, avoid expressions "The data", instead mention the sources of the flood data (not necesarily listing all of them).
    - Floods that are close and recent suggest a high risk of flooding. Floods over 5 kilometers away and old  suggest a low risk. However the number of floods can be a mitigating or aggravating factor.
    - Use kms as the distance unit
       
    Definitions:
    Business Description: A short description with a retail business idea.
    Address: The address where the potential business would be located.
    Floods: This text summarises the count of flood events from 2016 to 2020, sourced from seven merged datasets supporting diverse flood-related research. The sources are: University of Oklahoma's crowdsourced database,  Dartmouth Flood Observatory, Emergency Events Database by the Centre for Research on the Epidemiology of Disasters, NOAA's Storm Reports, University of Connecticut's Flood Events Database, Crowdsourced data from Twitter, NOAA's mPing app.
    Floods field information:
    - "lessThan5km": Flood events that occurred less than 5 kilometers away.
    - "over5km": Flood events that occurred more than 5 kilometers away.
    Reminder: a flood that happened in 2020 is very recent because this assesment takes place in 2021.

    Inputs:
    Business Description: ${value}
    Address: ${address}
    Floods: ${JSON.stringify(groupedFloods)}
    
    Examples of acceptable responses:
Example 1:

As a risk assessor for a business loan company, I have analyzed the business description, address, and flood data for John's Bakery. Here is my assessment:

**Business Description and Cost/Revenue Projections:**
John's Bakery is an upscale bakery focusing on organic, healthy, and premium food products, aligning with current health trends. The business is seeking $370,000 to launch, with $250,000 allocated for store design and build, and $120,000 for working capital to cover marketing, salaries, and lease costs until break-even. Based on industry benchmarks, I estimate the average monthly revenue to be around $50,000, with a projected annual revenue of $600,000. The break-even point is estimated to be around 6-8 months after launch.

**Local Competition and Demographics:**
The location of John's Bakery in Naples, FL, is a growing area with a high demand for upscale food products. The demographics suggest a affluent population with a strong interest in healthy living. However, there is moderate competition from existing bakeries in the area, which may impact market share.

**Flood Risk Assessment:**
The flood data indicates a high risk of flooding at the proposed location. There were 3 floods less than 5km away last year, and 6 floods less than 5km away in 2018. This suggests a recent and frequent history of flooding in the area. Although the number of floods over 5km away is higher, the proximity and recency of the floods less than 5km away are a significant concern. The flood risk is further exacerbated by the fact that the business is located in a flood-prone area, as indicated by the University of Oklahoma's crowdsourced database, Dartmouth Flood Observatory, and other sources.

**Risk Analysis:**
The high risk of flooding poses a significant threat to the business, particularly in terms of property damage and disruption to operations. The lack of flood insurance coverage was not mentioned in the business description, which is a concern. The business may need to consider investing in flood mitigation measures, such as flood-resistant construction and emergency preparedness plans.

Overall, while John's Bakery has a strong business concept and a growing market, the high risk of flooding at the proposed location is a significant concern. The business will need to carefully consider and mitigate this risk to ensure long-term success.

Example 2:
As a risk assessor for a business loan company, I have analyzed the Urban Cycle Fitness business proposal and identified potential risks and opportunities.

**Business Overview**
Urban Cycle Fitness aims to provide high-intensity indoor cycling classes with a focus on community and personal well-being. The business requires $500,000 to launch, which will be allocated towards studio design and build ($350,000) and working capital ($150,000) to cover marketing, instructor salaries, and lease costs.

**Location and Competition**
The proposed location is 195 S Red Rock St, Gilbert, AZ 85296, USA. Gilbert is a growing suburb with a strong focus on health and wellness, which aligns with the business's target market. However, there may be existing fitness studios in the area that could pose competition.

**Demographics and Foot Traffic**
The location is situated in a densely populated area with a high median income, which could support the business's target market. Foot traffic is moderate, with nearby shops and restaurants that could attract potential customers.

**Environmental Risks**
According to the flood data sourced from the University of Oklahoma's crowdsourced database, Dartmouth Flood Observatory, and other reputable sources, there was one flood event over 5 kilometers away in 2016. This suggests a relatively low risk of flooding, as the event was both distant and occurred several years ago. However, it is essential to note that the business does not have flood insurance, which could be a significant risk if a flood event were to occur in the future.

**Cost and Revenue Projections**
Initial Investment: $500,000
Projected Monthly Revenue: $30,000 (based on industry averages and market research)
Projected Monthly Expenses: $20,000 (studio operations, marketing, instructor salaries, and lease costs)
Projected Annual Profit: $120,000

Overall, Urban Cycle Fitness presents a moderate risk profile, with potential opportunities for growth in the Gilbert area. However, the business should consider investing in flood insurance to mitigate potential environmental risks.
    `
    console.log('prompt:',prompt);
    const response = await sendPromptToFireworks(prompt);
    console.log('response:',response);
    await setLlmResponse(response);
  };

  const handleGenerate = async () => {
    await setValue("... loading example ...");
    const prompt = `
    Instructions:
    - You will be stepping in the shoes of a person with a business idea. Which you will pitch, however avoid using introductory phrases like "Here is a business idea:".
    - This business idea has to have a physical real estate location in the USA. Do not provide a location however as this will be done seperatly.
    - Make sure the provide a business description, why does it want a loan and how is it planning on using it on.
    - If there are some risk, that you are aware of, mention them. 
    - Avoid reusing the "EcoCycle" business idea or the same business idea twice.
    - Don't use more than 150 words.

    Useful example:
    John’s Bakery is a new, upscale bakery focusing on providing organic, healthy and/or premium food products. Our product line fits nicely with health trends nationwide – while people still want pastries and baked goods, they want them to be as healthy as possible. 
John’s Bakery is currently seeking $370,000 to launch. Specifically, these funds will be used as follows:
• Store design/build: $250,000
• Working capital: $120,000 to pay for Marketing, salaries, and lease costs until John’s Bakery reaches  
    `
    console.log('prompt:',prompt);
    const response = await sendPromptToFireworks(prompt);
    console.log('response:',response);
    await setValue(response);

  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TextArea
        style={{ minWidth: '600px', minHeight: '190px', fontSize : "16px" }}
        onChange={event => {
          setValue(event.target.value);
        }}
        value={value}
        disabled={llmResponse !== ''} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
        <SpeechToText onSpeechResult={handleSpeechResult} /> 
        <Button onClick={() => {
          setLlmResponse('');
          setValue('');
          window.location.reload();
        }} disabled={llmResponse == ''}>Clear</Button>
        <Button style={{ marginLeft: '5px' }} onClick={() => {
          handleGenerate();
        }} disabled={value !== ''}>Example</Button>
        <Button style={{ marginLeft: '5px' }} onClick={() => {
          handleSubmit();
        }} disabled={llmResponse !== ''}>Submit</Button>
      </div>
    </div>
  );
}

export default BusinessPlan;