function createLogger() {
  return {
    info: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
  };
}

function getEventData(params) {
  const value = params?.data?.value;
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value;
}

function buildMissingFields(data) {
  return ['email', 'firstname', 'lastname'].filter((field) => !data?.[field]);
}

function normalizeCustomerId(value) {
  return value ?? 'unknown';
}

export async function main(params = {}) {
  const logger = createLogger();
  const customer = getEventData(params);
  const customerId = normalizeCustomerId(customer?.id);

  try {
    logger.info('Commerce customer event received');
    logger.info(`Customer ID: ${customerId}`);

    if (!customer) {
      logger.info('Processed: false');
      logger.error('Validation error: missing params.data.value');
      return { statusCode: 400, body: { processed: false, reason: 'Validation error' } };
    }

    const missingFields = buildMissingFields(customer);
    if (missingFields.length > 0) {
      logger.info('Processed: false');
      logger.error(`Validation error: missing fields ${missingFields.join(', ')}`);
      return {
        statusCode: 400,
        body: { processed: false, reason: 'Validation error', missingFields },
      };
    }

    const fullName = `${customer.firstname} ${customer.lastname}`;
    const result = {
      customerId: customer.id,
      fullName,
      email: customer.email,
      customerType: 'new-commerce-customer',
      processed: true,
    };

    logger.info(`Full Name: ${fullName}`);
    logger.info(`Email: ${customer.email}`);
    logger.info('Customer Type: new-commerce-customer');
    logger.info('Processed: true');

    return { statusCode: 200, body: result };
  } catch (error) {
    logger.error('Unexpected error while processing customer event', {
      customerId,
      message: error instanceof Error ? error.message : String(error),
    });
    return { statusCode: 500, body: { processed: false, reason: 'Unexpected error' } };
  }
}
