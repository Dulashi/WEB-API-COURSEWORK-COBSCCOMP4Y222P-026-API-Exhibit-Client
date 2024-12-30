import React, { useState } from 'react';
import axios from 'axios';

function ClientApiTester(){
  const [httpMethod, setHttpMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [queryString, setQueryString] = useState('');
  const [headerConfig, setHeaderConfig] = useState('');
  const [pathVariables, setPathVariables] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [responseHeaders, setResponseHeaders] = useState('');
  const [httpStatus, setHttpStatus] = useState('');
  const [errorCategory, setErrorCategory] = useState('');
  const [curlSnippet, setCurlSnippet] = useState('');
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');

  const generateCurlCommand = (config) => {
    let curl = `curl -X ${config.method.toUpperCase()} "${config.url}"`;

    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        curl += ` -H "${key}: ${value}"`;
      }
    }

    if (config.params) {
      const query = new URLSearchParams(config.params).toString();
      curl += `?${query}`;
    }

    if (config.data) {
      curl += ` -d '${JSON.stringify(config.data)}'`;
    }

    return curl;
  };

  const executeHttpRequest = async () => {
    if (!endpoint || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(endpoint)) {
      setApiResponse('Invalid URL. Please enter a valid endpoint.');
      return;
    }

    let parameters = {};
    let headers = {};

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (queryString) {
      queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key && value) {
          parameters[key] = value;
        }
      });
    }

    let urlWithPathVars = endpoint;

    if (pathVariables) {
      try {
        const parsedPathVars = JSON.parse(pathVariables);
        for (const [key, value] of Object.entries(parsedPathVars)) {
          const placeholder = new RegExp(`:${key}`, 'g');
          urlWithPathVars = urlWithPathVars.replace(placeholder, encodeURIComponent(value));
        }
      } catch {
        setApiResponse('Invalid path variables. Use valid JSON format.');
        return;
      }
    }

    if (headerConfig) {
      try {
        headers = { ...headers, ...JSON.parse(headerConfig) };
      } catch {
        setApiResponse('Invalid header format. Use valid JSON.');
        return;
      }
    }

    setLoading(true);
    setErrorCategory('');
    setHttpStatus('');

    try {
      const config = {
        method: httpMethod,
        url: urlWithPathVars,
        params: parameters,
        headers,
        data: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod) && requestBody ? JSON.parse(requestBody) : undefined,
      };

      setCurlSnippet(generateCurlCommand(config));

      const response = await axios(config);

      const formattedHeaders = Object.entries(response.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      setResponseHeaders(formattedHeaders);
      setApiResponse(JSON.stringify(response.data, null, 2));
      setHttpStatus(response.status);
    } catch (err) {
      const formattedHeaders = err.response
        ? Object.entries(err.response.headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        : 'No headers available';

      setResponseHeaders(formattedHeaders);
      setApiResponse(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
      setHttpStatus(err.response ? err.response.status : 'N/A');
      setErrorCategory(err.code || 'Unknown Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#1A202C', color: '#CBD5E0', padding: '20px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#63B3ED' }}>HTTP Request Simulator</h1>
      <div style={{ background: '#2D3748', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>Request Details</h3>
        <div>
          <label>HTTP Method: </label>
          <select value={httpMethod} onChange={(e) => setHttpMethod(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </div>
        <div>
          <label>Endpoint URL: </label>
          <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
        </div>
        <div>
          <label>Authorization Token: </label>
          <input type="text" value={authToken} onChange={(e) => setAuthToken(e.target.value)} style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
        </div>
        <div>
          <label>Path Variables (JSON): </label>
          <textarea value={pathVariables} onChange={(e) => setPathVariables(e.target.value)} rows="2" style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
        </div>
        <div>
          <label>Query Parameters: </label>
          <textarea value={queryString} onChange={(e) => setQueryString(e.target.value)} rows="2" style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
        </div>
        <div>
          <label>Headers (JSON): </label>
          <textarea value={headerConfig} onChange={(e) => setHeaderConfig(e.target.value)} rows="2" style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
        </div>
        {['POST', 'PUT', 'PATCH'].includes(httpMethod) && (
          <div>
            <label>Request Body (JSON): </label>
            <textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)} rows="4" style={{ width: '100%', margin: '10px 0', padding: '8px' }} />
          </div>
        )}
        <button onClick={executeHttpRequest} disabled={loading} style={{ padding: '10px 15px', background: '#38B2AC', color: '#FFF', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>
      <h3>Response</h3>
      <pre>{`cURL Command: ${curlSnippet}`}</pre>
      <pre>{`Status Code: ${httpStatus}`}</pre>
      <pre>{`Error Type: ${errorCategory}`}</pre>
      <pre>{`Response Headers: ${responseHeaders}`}</pre>
      <pre>{`Response Body: ${apiResponse}`}</pre>
    </div>
  );
}

export default ClientApiTester;
