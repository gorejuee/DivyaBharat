<template>
  <div class="mandala-row">
    <span class="ml-rule ml-rule--l" />
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" stroke="rgba(200,134,30,0.32)" stroke-width="0.6"/>
      <circle cx="18" cy="18" r="10" stroke="rgba(200,134,30,0.32)" stroke-width="0.6"/>
      <circle cx="18" cy="18" r="4"  stroke="rgba(200,134,30,0.32)" stroke-width="0.6"/>
      <circle cx="18" cy="18" r="1.8" fill="rgba(200,134,30,0.65)"/>
      <line x1="18" y1="2"  x2="18" y2="34" stroke="rgba(200,134,30,0.18)" stroke-width="0.5"/>
      <line x1="2"  y1="18" x2="34" y2="18" stroke="rgba(200,134,30,0.18)" stroke-width="0.5"/>
      <line x1="5"  y1="5"  x2="31" y2="31" stroke="rgba(200,134,30,0.12)" stroke-width="0.5"/>
      <line x1="31" y1="5"  x2="5"  y2="31" stroke="rgba(200,134,30,0.12)" stroke-width="0.5"/>
    </svg>
    <span class="ml-rule ml-rule--r" />
  </div>
</template>

<style>
.mandala-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 32px 0;
  width: 100%;
}
.ml-rule {
  flex: 1;
  max-width: 100px;
  height: 1px;
}
.ml-rule--l { background: linear-gradient(to right, transparent, rgba(200,134,30,0.32)); }
.ml-rule--r { background: linear-gradient(to left,  transparent, rgba(200,134,30,0.32)); }
</style>
