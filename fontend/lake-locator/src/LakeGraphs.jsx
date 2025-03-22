import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LakeGraphs = ({ nearestLakes }) => {
  // Prepare data for the graphs
  const dissolvedOxygenData = nearestLakes.map((lake) => ({
    name: lake.name,
    "Dissolved O2 (mg/L)": lake.dissolved_oxygen,
  }));

  const phData = nearestLakes.map((lake) => ({
    name: lake.name,
    pH: lake.ph,
  }));

  const bodData = nearestLakes.map((lake) => ({
    name: lake.name,
    "BOD (mg/L)": lake.bod,
  }));

  const nitrateData = nearestLakes.map((lake) => ({
    name: lake.name,
    "NitrateN (mg/L)": lake.nitrate,
  }));

  const tdsData = nearestLakes.map((lake) => ({
    name: lake.name,
    "Total Dissolved Solids (mg/L)": lake.total_dissolved_solids,
  }));

  return (
    <div className="lake-graphs">
      <h2>Water Quality Parameters for Nearest Lakes</h2>

      {/* Dissolved Oxygen Graph */}
      <div className="graph-container">
        <h3>Dissolved Oxygen (mg/L)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dissolvedOxygenData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Dissolved O2 (mg/L)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* pH Graph */}
      <div className="graph-container">
        <h3>pH</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={phData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pH" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BOD Graph */}
      <div className="graph-container">
        <h3>Biological Oxygen Demand (BOD) (mg/L)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bodData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="BOD (mg/L)" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nitrate Graph */}
      <div className="graph-container">
        <h3>NitrateN (mg/L)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={nitrateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="NitrateN (mg/L)" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total Dissolved Solids Graph */}
      <div className="graph-container">
        <h3>Total Dissolved Solids (mg/L)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tdsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total Dissolved Solids (mg/L)" fill="#0088fe" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LakeGraphs;