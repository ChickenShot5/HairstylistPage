export default function BusinessCard() {
  return (
    <section>
      <h1>Violeta's Hair Studio</h1>
      <img src="/stylist.jpg" alt="Hairstylist" width="200" />
      <p>Specialist in cuts, coloring & styling</p>
      <p>Hours: Mon–Sat, 10 AM – 6 PM</p>
      <p>Address: Strada Florilor 10, Oradea</p>
      <iframe
        title="Google Map"
        src="https://maps.google.com/maps?q=Oradea&t=&z=13&ie=UTF8&iwloc=&output=embed"
        width="100%"
        height="200"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      ></iframe>
    </section>
  );
}
