export const isNil = <T>(value: T) => {
  if (value === null) return true;
  if (value === undefined) return true;

  return false;
};

export const isNotNil = <T>(value: T) => {
  return !isNil(value);
};
