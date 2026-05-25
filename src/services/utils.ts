export const formatKeyId = (str: string): string => {
  // cc = Control Change
  const [cc, key, velocity]: Array<string> = JSON.parse(str);

  return key;
};
