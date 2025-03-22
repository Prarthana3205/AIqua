import { useLocation } from "react-router-dom";

function LakeDetails() {
  const location = useLocation();
  const { lake } = location.state || {};

  if (!lake) {
    return <div>No lake data found.</div>;
  }

  return (
    <div className="lake-details">
      <h1>{lake["Lake Name"]}</h1>
      <p>
        <strong>Latitude and Longitude:</strong> {lake["Latitude and Longitude"]}
      </p>
      <p>
        <strong>Description:</strong> {lake["Description"] || "No description available."}
      </p>
      <button onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
}

export default LakeDetails;