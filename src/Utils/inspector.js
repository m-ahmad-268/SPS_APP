export const inspectApiCall = (url, method, data, headers, response) => {
  // console.log('--- API Call Inspector ---');
  console.log('URL:', url);
  // console.log('Method:', method);
  // console.log('Request Data:', JSON.stringify(data, null, 2));
  // console.log('Headers:', JSON.stringify(headers, null, 2));
  if (response instanceof Error) {
    //console.log('Error Response:', response);
    console.log('Error Details:', response.response ? response.response.data : response);
    // console.log('Error Response:', response.response);
    console.log('Error code:', response.response.data.code);


  } else {
    // console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('Response Status:', response.data.code);
  }
  console.log('---------------------------');
};
