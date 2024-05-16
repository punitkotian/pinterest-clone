const validateFields = (...fields) => {
  return fields.some(
    (field) => field === undefined || field === null || field?.trim() === ""
  );
};

export { validateFields };
