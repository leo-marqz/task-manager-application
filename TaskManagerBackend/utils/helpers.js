
function generateId(){
    return Date.now().toString(32) + Math.random().toString(32).substring(2);
}

function generateUniqueFilename(originalname) {
    const uniqueSuffix = `${Date.now()}-${generateId()}`;
    const fileExtension = originalname.split('.').pop();
    return `${uniqueSuffix}.${fileExtension}`;
}

export { generateId, generateUniqueFilename };