import { useLocation, useNavigate } from 'react-router-dom';

// Link that scrolls to a section of the home page (works every time it is clicked,
// and from any other page it first goes to the home page, then scrolls).
export default function HashLink({ id, children, onClick, ...rest }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handle = (e) => {
    e.preventDefault();
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `/#${id}`);
    } else {
      navigate(`/#${id}`);
    }
    onClick?.(e);
  };

  return <a href={`/#${id}`} onClick={handle} {...rest}>{children}</a>;
}