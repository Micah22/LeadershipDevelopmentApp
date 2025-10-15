// Simple test script
console.log('Test script loaded');

function testFunction() {
    console.log('Test function called');
    return 'Test function works!';
}

// Make it globally accessible
window.testFunction = testFunction;
