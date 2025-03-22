export const url = (lat, long) => {
  let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${long}&lon=${lat}`;
  return url;
};

export const locationData = async (loc) => {
  const res = await fetch(url(loc[0], loc[1]))
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });
  return res;
};
