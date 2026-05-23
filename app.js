const btn = document.getElementById('calculate-btn');
const resultsDiv = document.getElementById('results');

function formatDistance(meters) {
  const roundedMeters = Math.round(Number(meters));

  if (!Number.isFinite(roundedMeters)) {
    return '--';
  }

  if (roundedMeters < 1000) {
    return `${roundedMeters} m`;
  }

  return `${Math.round(roundedMeters / 1000)} km`;
}

function formatDuration(seconds) {
  const totalSeconds = Math.round(Number(seconds));

  if (!Number.isFinite(totalSeconds)) {
    return '--';
  }

  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  if (totalSeconds < 3600) {
    return `${Math.round(totalSeconds / 60)} min`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  const hourLabel = hours === 1 ? 'hr' : 'hrs';

  if (minutes === 0) {
    return `${hours} ${hourLabel}`;
  }

  if (minutes === 60) {
    return `${hours + 1} ${hours + 1 === 1 ? 'hr' : 'hrs'}`;
  }

  return `${hours} ${hourLabel} ${minutes} min`;
}

btn.addEventListener('click', async () => {
  const officeInput = document.getElementById('office').value.trim();
  const office = officeInput.trim().split(/\s*,\s*/).map(Number);

  const rentalInput = document.getElementById('rental').value.trim();
  const rental = rentalInput.trim().split(/\s*,\s*/).map(Number);

  if (!office || !rental) {
    alert('Please enter both locations!');
    return;
  }

  // Mapbox access token (per account)
  mapboxgl.accessToken = MAPBOX_TOKEN;

  const start = office;

  // Function for walking distance and duration
  async function getWalk(end) {
    // make a directions request using cycling profile
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&access_token=${mapboxgl.accessToken}`
    );
    const json = await query.json();
    const data = json.routes[0];


    return {
      distance: data.distance,
      duration: data.duration
    };
  }

  // Function for driving duration
  async function getDrive(end) {
    // make a directions request using cycling profile
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&access_token=${mapboxgl.accessToken}`
    );
    const json = await query.json();
    const data = json.routes[0];


    return {
      duration: data.duration
    };
  }


  // Execute getWalk, output needed data
  const walkResults = await getWalk(rental);
  const resultsDistance = walkResults.distance;
  const resultsWalkingTime = walkResults.duration;

  // Execute getDrive, output needed data
  const driveResults = await getDrive(rental);
  const resultsDriveTime = driveResults.duration;


  // Logic for checking if walking is doable
  const walkMinutes = resultsWalkingTime / 60;

  function getVerdict(minutes) {
    if (minutes <= 10) return 'Walkable';
    if (minutes <= 20) return 'Manageable';
    return 'Better to drive';
  }

  document.getElementById('verdict').textContent = getVerdict(walkMinutes);





  // Displaying data
  document.getElementById('walk-time').textContent = formatDuration(resultsWalkingTime);
  document.getElementById('drive-time').textContent = formatDuration(resultsDriveTime);
  document.getElementById('distance').textContent = formatDistance(resultsDistance);
  document.getElementById('verdict').textContent = getVerdict(walkMinutes)

  resultsDiv.classList.remove('hidden');
});
