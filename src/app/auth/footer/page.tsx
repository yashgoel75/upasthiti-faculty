export default function Footer() {
  const fullDate = new Date();
  const year = fullDate.getFullYear();
  return (
    <>
      <div className="bottom-0 left-0 w-full bg-gray-100 text-center py-4 shadow">
        &copy;&nbsp;{year} Upasthiti. All rights reserved.
      </div>
    </>
  );
}