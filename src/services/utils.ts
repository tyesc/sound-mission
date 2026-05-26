export const formatKeyId = (str: string): number => {
  // cc = Control Change, key, velocity
  const [_, key, __]: Array<string> = JSON.parse(str);

  return Number(key);
};
