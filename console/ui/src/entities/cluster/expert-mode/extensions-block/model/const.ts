export const EXTENSION_BLOCK_FIELD_NAMES = Object.freeze({
  EXTENSIONS: 'extensions',
  IS_ENABLED: 'isEnabled',
});

export const extensionIcons = Object.entries(
  import.meta.glob('../assets/*.{png,jpg,jpeg,svg,PNG,JPEG,SVG}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
).reduce((acc, [key, value]) => {
  const iconName = key.match(/(\w*.\w*)$/gi);
  return iconName?.[0] ? { ...acc, [iconName[0]]: value } : acc;
}, {});
