"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProviderB = exports.MockProviderA = void 0;
class MockProviderA {
    constructor() {
        this.name = 'MockProviderA';
    }
    async send(email) {
        // Simulate random failure
        return Math.random() > 0.3;
    }
}
exports.MockProviderA = MockProviderA;
class MockProviderB {
    constructor() {
        this.name = 'MockProviderB';
    }
    async send(email) {
        // Simulate random failure
        return Math.random() > 0.5;
    }
}
exports.MockProviderB = MockProviderB;
// ...existing code...
