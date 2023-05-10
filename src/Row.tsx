import "./Row.css";

const Row = (p: { name: string; children: React.ReactNode }) => {
  const { name, children } = p;

  return (
    <div className="Row">
      <div className="column">{name}</div>
      <div className="column">{children}</div>
    </div>
  );
};

export default Row;
