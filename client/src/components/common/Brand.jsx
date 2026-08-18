import brandIcon from '../../assets/icon.svg';

export function BrandIcon(props) {
  const size = props.size || 30;
  
  return (
    <img
      src={brandIcon}
      width={size}
      height={size}
      alt='Brand Icon'
      loading='eager'
      fetchpriority='high'
    />
  );
}

export function BrandHeader(props) {
  const base = props.size || 12;
  const description = props.desc || false;
  
  const sizes = {
    imageSize: base * 3,
    imagePadding: 'p-' + base * 30,
    title: base,
    text: base,
    gap: base * 0.5,
  };
  
  return (
    <div class=':uno: flex items-center'>
      
      <div class={`:uno: rounded-2xl shadow-sm shadow-primary ${sizes.imagePadding}`}>
        <BrandIcon size={sizes.imageSize} />
      </div>
      <div class=':uno: text-[var(--title)] leading-4'>
        <p class=':uno: font-black'>KEGIATAN</p>
        <p class=':uno: font-extrabold'>Pegawai BPMPTP</p>
        {description && (
          <p class=':uno: '>Pengelola kegiatan pegawai BPMPTP</p>
        )}
      </div>
    </div>
  );
}