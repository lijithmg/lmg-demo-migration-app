import assert from 'node:assert/strict';
import { main } from './index.js';

function captureConsole() {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));

  return {
    logs,
    errors,
    restore() {
      console.log = originalLog;
      console.error = originalError;
    },
  };
}

async function run() {
  {
    const captured = captureConsole();
    const response = await main({
      data: {
        value: {
          id: 100245,
          email: 'john.doe@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      },
    });

    captured.restore();

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      customerId: 100245,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      customerType: 'new-commerce-customer',
      processed: true,
    });
    assert.deepEqual(captured.logs, [
      'Commerce customer event received',
      'Customer ID: 100245',
      'Full Name: John Doe',
      'Email: john.doe@example.com',
      'Customer Type: new-commerce-customer',
      'Processed: true',
    ]);
    assert.equal(captured.errors.length, 0);
  }

  {
    const captured = captureConsole();
    const response = await main({
      data: {
        value: {
          id: 100245,
          email: 'john.doe@example.com',
          firstname: 'John',
        },
      },
    });

    captured.restore();

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.processed, false);
    assert.equal(response.body.reason, 'Validation error');
    assert.deepEqual(response.body.missingFields, ['lastname']);
    assert.deepEqual(captured.logs, [
      'Commerce customer event received',
      'Customer ID: 100245',
      'Processed: false',
    ]);
    assert.match(captured.errors.join('\n'), /missing fields lastname/);
  }

  {
    const captured = captureConsole();
    const payload = {
      id: 100245,
      email: 'john.doe@example.com',
      firstname: 'John',
      lastname: 'Doe',
      secretField: 'should-not-appear',
    };
    const response = await main({ data: { value: payload } });

    captured.restore();

    assert.equal(response.statusCode, 200);
    assert.equal(captured.logs.join('\n').includes('should-not-appear'), false);
    assert.equal(captured.errors.join('\n').includes('should-not-appear'), false);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
