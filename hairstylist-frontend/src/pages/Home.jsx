import Navbar from "../components/Navbar";
import BusinessCard from "../components/BusinessCard";
import Scheduler from "../components/Scheduler";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <BusinessCard />
        <Scheduler />
      </main>
    </>
  );
}
