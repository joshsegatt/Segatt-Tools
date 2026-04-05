mod features;

use crate::features::packages::{search_packages, install_package_stream};
use crate::features::tweaks::{get_tweaks, apply_tweak, create_restore_point, check_admin};
use crate::features::ai::{get_system_context, chat_with_segatt_ai, get_smart_diagnostic};
use crate::features::cleaner::run_cleanup;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  builder = builder
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init());
    // .plugin(tauri_plugin_updater::Builder::new().build());

  if cfg!(debug_assertions) {
    builder = builder.plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    );
  }

  builder
    .setup(|_app| {
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      search_packages,
      install_package_stream,
      get_tweaks,
      apply_tweak,
      create_restore_point,
      check_admin,
      get_system_context,
      chat_with_segatt_ai,
      get_smart_diagnostic,
      run_cleanup
    ])




    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

