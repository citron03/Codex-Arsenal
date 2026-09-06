export function readOption(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  const value = args[index + 1];
  // A missing value, or the next flag, must not be consumed as this option's value.
  if (!value || value.startsWith("-")) {
    return fallback;
  }
  return value;
}

export function readListOption(args, name) {
  const value = readOption(args, name, "");
  if (!value) {
    return [];
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
