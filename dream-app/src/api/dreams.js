const apiURL = 'http://127.0.0.1:8000/';

export async function fetchDreamsByMonth(year, month) {
  try {
    const response = await fetch(`${apiURL}dreams?year=${year}&month=${month}`);
    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status}): ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching dreams by month:', error);
    throw error;
  }
}

export async function fetchDreamById(id) {
  try {
    const response = await fetch(`${apiURL}dreams/${id}`);
    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status}): ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(`Error fetching dream ${id}:`, error);
    throw error;
  }
}
