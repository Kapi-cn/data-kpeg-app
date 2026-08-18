import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { getCurrentUser } from '../../services/auth.js';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import BackdropEffect from './BackdropEffect';
import Breadcrumb from './Breadcrumb';

export default function AppLayout(props) {
  const navigate = useNavigate();

  const [user, setUser] = createSignal(null);

  onMount(async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(currentUser);
  });

  return (
    <Show when={user()}>
      <div class=':uno: flex min-h-screen bg-zinc-100'>
        <Sidebar />
        <BackdropEffect />

        <div class=':uno: flex flex-1 flex-col min-w-0 md:pl-64 2xl:pl-85'>
          <Header user={user()} />
          <Breadcrumb />

          <main class=':uno: flex-1 px-6 py-8'>{props.children}</main>

          <Footer />
        </div>
      </div>
    </Show>
  );
}
