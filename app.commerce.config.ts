export default {
  metadata: {
    id: "customer-event-logger",
    displayName: "Customer Event Logger",
    description: "Logs processed Adobe Commerce customer save events for verification, fully stateless.",
    version: "1.0.0",
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: "Commerce Events Provider",
          description: "Receives Adobe Commerce customer save notifications.",
        },
        events: [
          {
            name: "observer.customer_save_commit_after",
            label: "Customer Save Commit After",
            description: "Triggered after a customer is saved in Adobe Commerce.",
            fields: [
              { name: "id" },
              { name: "email" },
              { name: "firstname" },
              { name: "lastname" },
            ],
            runtimeActions: ["customer-event-logger/customer-event-processor"],
          },
        ],
      },
    ],
  },
};
