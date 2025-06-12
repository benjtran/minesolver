const response = await fetch('https://serverless.roboflow.com/infer/workflows/school-mu231/detect-count-and-visualize', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        api_key: '0J470nlTFy0obprDGPDU',
        inputs: {
            "image": {"type": "url", "value": "IMAGE_URL"}
        }
    })
});

const result = await response.json();
console.log(result);