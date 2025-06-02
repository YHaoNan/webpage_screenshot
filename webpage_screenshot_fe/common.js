function requireNonNull(value, errorMessage = 'Value is null') {
    if (!value) {
        throw new Error(errorMessage);
    }
    return value;
}


export {
    requireNonNull
}