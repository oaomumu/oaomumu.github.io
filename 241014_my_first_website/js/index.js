fetch('IMG_sognxie.txt')
    .then(response => response.text())
    .then(data => {
        const imgElement = document.getElementById('myImage');
        imgElement.src = data; // 设置图片的 src 属性
    })
    .catch(error => console.error('Error loading image:', error));