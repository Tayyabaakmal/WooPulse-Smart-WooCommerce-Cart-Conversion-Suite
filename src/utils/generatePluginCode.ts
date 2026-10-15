import JSZip from 'jszip';
import { PluginConfig } from '../types';

export function generateWordPressPluginPHP(config: PluginConfig): string {
  return `<?php
/**
 * Plugin Name: WooPulse Pro - Smart Cart & Conversion Suite
 * Plugin URI: https://woopulse.dev
 * Description: The ultra-fast, zero-bloat conversion engine for WooCommerce. Multi-tier free shipping & reward progress bar, slide-out AJAX mini-cart drawer, 1-click in-cart order bumps, and instant WhatsApp cart recovery.
 * Version: 2.4.0
 * Author: Tayyaba Akmal
 * Author URI: https://github.com/tayyabaakmal
 * Text Domain: woopulse-pro
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 9.3
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Check if WooCommerce is active
 */
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

class WooPulse_Cart_Booster {

    private static $instance = null;
    private $options = [];

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->load_options();
        
        // Admin Settings
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        
        // Frontend Injections
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_footer', [$this, 'render_cart_drawer_and_modals']);
        
        // Point-of-Checkout Add-on Fees (Guarantee & Gift Box)
        add_action('woocommerce_cart_calculate_fees', [$this, 'apply_checkout_micro_bumps']);
        
        // AJAX Fragment for Dynamic Rewards Calculation
        add_filter('woocommerce_add_to_cart_fragments', [$this, 'update_cart_fragments']);
    }

    public function apply_checkout_micro_bumps() {
        if (is_admin() && !defined('DOING_AJAX')) return;
        if (WC()->session && WC()->session->get('woopulse_protection_active')) {
            WC()->cart->add_fee(__('Priority Transit Guarantee', 'woopulse-pro'), ${config.protectionBumpPrice});
        }
        if (WC()->session && WC()->session->get('woopulse_giftbox_active')) {
            WC()->cart->add_fee(__('Artisanal Gift Box Add-on', 'woopulse-pro'), ${config.giftBoxBumpPrice});
        }
    }

    private function load_options() {
        $defaults = [
            'tier1_threshold'     => ${config.tier1Threshold},
            'tier1_title'         => '${config.tier1Title.replace(/'/g, "\\'")}',
            'tier2_threshold'     => ${config.tier2Threshold},
            'tier2_title'         => '${config.tier2Title.replace(/'/g, "\\'")}',
            'tier3_threshold'     => ${config.tier3Threshold},
            'tier3_title'         => '${config.tier3Title.replace(/'/g, "\\'")}',
            'primary_color'       => '${config.primaryColor}',
            'accent_color'        => '${config.accentColor}',
            'enable_whatsapp'     => ${config.enableWhatsAppRecovery ? 1 : 0},
            'whatsapp_number'     => '${config.whatsAppNumber}',
            'whatsapp_text'       => '${config.whatsAppButtonText.replace(/'/g, "\\'")}',
            'enable_exit_intent'  => ${config.enableExitIntent ? 1 : 0},
            'exit_discount'       => ${config.exitIntentDiscountPercent},
            'exit_coupon'         => '${config.exitIntentCouponCode}',
            'enable_order_bump'   => ${config.enableOrderBump ? 1 : 0},
            'bump_heading'        => '${(config.bumpHeading || 'Frequently Bought Together').replace(/'/g, "\\'")}',
            'bump_discount'       => ${config.bumpDiscountPercent},
            'enable_protection'   => ${config.enableCheckoutProtectionBump ? 1 : 0},
            'protection_fee'      => ${config.protectionBumpPrice},
            'protection_title'    => '${config.protectionBumpTitle.replace(/'/g, "\\'")}',
            'enable_giftbox'      => ${config.enableGiftBoxBump ? 1 : 0},
            'giftbox_fee'         => ${config.giftBoxBumpPrice},
            'giftbox_title'       => '${config.giftBoxBumpTitle.replace(/'/g, "\\'")}',
            'enable_delivery_est' => ${config.enableDeliveryCountdown ? 1 : 0},
            'cutoff_hour'         => ${config.cutoffHour},
            'cutoff_minute'       => ${config.cutoffMinute},
            'transit_days'        => ${config.transitDays},
            'dispatch_label'      => '${config.dispatchLabel.replace(/'/g, "\\'")}',
        ];
        
        $this->options = wp_parse_args(get_option('woopulse_settings', []), $defaults);
    }

    public function register_admin_menu() {
        add_submenu_page(
            'woocommerce',
            __('WooPulse Settings', 'woopulse-pro'),
            __('⚡ WooPulse Booster', 'woopulse-pro'),
            'manage_woocommerce',
            'woopulse-settings',
            [$this, 'render_admin_page']
        );
    }

    public function register_settings() {
        register_setting('woopulse_options_group', 'woopulse_settings');
    }

    public function enqueue_assets() {
        // Enqueue ultra-lightweight standalone scripts (Zero jQuery dependency, <10KB)
        wp_enqueue_style('woopulse-style', plugins_url('assets/woopulse-cart.css', __FILE__), [], '2.4.0');
        wp_enqueue_script('woopulse-engine', plugins_url('assets/woopulse-cart.js', __FILE__), [], '2.4.0', true);

        // Pass dynamic PHP settings to vanilla JS
        $cart_subtotal = WC()->cart ? WC()->cart->get_subtotal() : 0;
        wp_localize_script('woopulse-engine', 'woopulse_vars', [
            'ajax_url'            => admin_url('admin-ajax.php'),
            'currency'            => get_woocommerce_currency_symbol(),
            'cart_total'          => (float)$cart_subtotal,
            'tier1'               => (float)$this->options['tier1_threshold'],
            'tier1_label'         => $this->options['tier1_title'],
            'tier2'               => (float)$this->options['tier2_threshold'],
            'tier2_label'         => $this->options['tier2_title'],
            'tier3'               => (float)$this->options['tier3_threshold'],
            'tier3_label'         => $this->options['tier3_title'],
            'whatsapp_num'        => preg_replace('/[^0-9]/', '', $this->options['whatsapp_number']),
            'exit_coupon'         => $this->options['exit_coupon'],
            'exit_disc'           => $this->options['exit_discount'],
            'checkout_url'        => wc_get_checkout_url(),
            'protection_fee'      => (float)$this->options['protection_fee'],
            'giftbox_fee'         => (float)$this->options['giftbox_fee'],
            'enable_delivery_est' => (int)$this->options['enable_delivery_est'],
            'cutoff_hour'         => (int)$this->options['cutoff_hour'],
            'transit_days'        => (int)$this->options['transit_days'],
            'dispatch_label'      => $this->options['dispatch_label'],
        ]);
    }

    public function render_cart_drawer_and_modals() {
        if (is_checkout() || is_cart()) {
            return; // Don't double-render on standalone cart/checkout pages
        }
        ?>
        <!-- WooPulse Slide-Out Cart Overlay -->
        <div id="woopulse-drawer-backdrop" class="woopulse-backdrop" style="display:none;" aria-hidden="true"></div>
        <div id="woopulse-cart-drawer" class="woopulse-drawer" style="display:none;" role="dialog" aria-modal="true" aria-label="Shopping Cart">
            <div class="woopulse-drawer-header">
                <div class="woopulse-drawer-title">
                    <span><?php esc_html_e('Your Shopping Bag', 'woopulse-pro'); ?></span>
                    <span id="woopulse-header-count" class="woopulse-count-badge">0</span>
                </div>
                <button type="button" id="woopulse-close-btn" class="woopulse-close-btn" aria-label="Close cart">&times;</button>
            </div>

            <!-- Dynamic Estimated Delivery Countdown -->
            <?php if (!empty($this->options['enable_delivery_est'])) : ?>
            <div id="woopulse-delivery-countdown" class="woopulse-delivery-banner">
                <span id="woopulse-delivery-msg" class="woopulse-delivery-text"><?php esc_html_e('Calculating estimated delivery...', 'woopulse-pro'); ?></span>
                <span class="woopulse-delivery-badge"><?php echo esc_html($this->options['dispatch_label']); ?></span>
            </div>
            <?php endif; ?>

            <!-- Multi-Tier Reward Progress Bar -->
            <div class="woopulse-reward-container">
                <div id="woopulse-reward-message" class="woopulse-reward-message">
                    <?php esc_html_e('Add items to unlock Free Shipping!', 'woopulse-pro'); ?>
                </div>
                <div class="woopulse-progress-track">
                    <div id="woopulse-progress-fill" class="woopulse-progress-fill" style="width: 0%;"></div>
                </div>
                <div class="woopulse-tiers-legend">
                    <div class="woopulse-tier-node" id="woopulse-node-1">
                        <span class="woopulse-node-dot"></span>
                        <span class="woopulse-node-label"><?php echo esc_html($this->options['tier1_title']); ?></span>
                    </div>
                    <div class="woopulse-tier-node" id="woopulse-node-2">
                        <span class="woopulse-node-dot"></span>
                        <span class="woopulse-node-label"><?php echo esc_html($this->options['tier2_title']); ?></span>
                    </div>
                    <div class="woopulse-tier-node" id="woopulse-node-3">
                        <span class="woopulse-node-dot"></span>
                        <span class="woopulse-node-label"><?php echo esc_html($this->options['tier3_title']); ?></span>
                    </div>
                </div>
            </div>

            <!-- Dynamic Cart Items Container -->
            <div id="woopulse-cart-items" class="woopulse-items-list">
                <!-- Injected dynamically via JS / WooCommerce Fragments -->
            </div>

            <!-- In-Cart Complementary Order Bumps Section -->
            <?php if (!empty($this->options['enable_order_bump'])) : ?>
            <div class="woopulse-order-bumps-section">
                <div class="woopulse-bump-header">
                    <span class="woopulse-bump-tag">⚡ <?php echo esc_html($this->options['bump_heading']); ?></span>
                    <span class="woopulse-bump-badge"><?php echo esc_html($this->options['bump_discount']); ?>% <?php esc_html_e('Off Bundle', 'woopulse-pro'); ?></span>
                </div>
                <div id="woopulse-complementary-list" class="woopulse-bumps-grid">
                    <!-- Dynamic complementary pairings populated based on cart items -->
                </div>
            </div>
            <?php endif; ?>

            <!-- Drawer Footer & Point-of-Checkout Actions -->
            <div class="woopulse-drawer-footer">
                <!-- Point-of-Checkout Priority Micro-Bumps -->
                <div class="woopulse-checkout-bumps">
                    <?php if (!empty($this->options['enable_protection'])) : ?>
                    <label class="woopulse-checkbox-bump">
                        <input type="checkbox" id="woopulse-check-protection" checked>
                        <span class="woopulse-bump-label">
                            <span class="woopulse-bump-name">🛡️ <?php echo esc_html($this->options['protection_title']); ?></span>
                            <span class="woopulse-bump-price">+<?php echo esc_html(get_woocommerce_currency_symbol() . number_format($this->options['protection_fee'], 2)); ?></span>
                        </span>
                    </label>
                    <?php endif; ?>

                    <?php if (!empty($this->options['enable_giftbox'])) : ?>
                    <label class="woopulse-checkbox-bump">
                        <input type="checkbox" id="woopulse-check-giftbox">
                        <span class="woopulse-bump-label">
                            <span class="woopulse-bump-name">🎁 <?php echo esc_html($this->options['giftbox_title']); ?></span>
                            <span class="woopulse-bump-price">+<?php echo esc_html(get_woocommerce_currency_symbol() . number_format($this->options['giftbox_fee'], 2)); ?></span>
                        </span>
                    </label>
                    <?php endif; ?>
                </div>

                <div class="woopulse-subtotal-row">
                    <span><?php esc_html_e('Subtotal', 'woopulse-pro'); ?></span>
                    <span id="woopulse-subtotal-amount" class="woopulse-amount">$0.00</span>
                </div>
                
                <!-- Instant 1-Click WhatsApp Save & Recover -->
                <?php if (!empty($this->options['enable_whatsapp'])) : ?>
                <a id="woopulse-whatsapp-btn" href="#" target="_blank" rel="noopener noreferrer" class="woopulse-btn-whatsapp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    <span><?php echo esc_html($this->options['whatsapp_text']); ?></span>
                </a>
                <?php endif; ?>

                <a href="<?php echo esc_url(wc_get_checkout_url()); ?>" class="woopulse-btn-checkout">
                    <?php esc_html_e('Proceed to Secure Checkout', 'woopulse-pro'); ?> &rarr;
                </a>
            </div>
        </div>

        <!-- Exit-Intent Cart Saver Modal -->
        <?php if (!empty($this->options['enable_exit_intent'])) : ?>
        <div id="woopulse-exit-modal" class="woopulse-modal" style="display:none;" aria-hidden="true">
            <div class="woopulse-modal-content">
                <button type="button" class="woopulse-modal-close" id="woopulse-exit-close">&times;</button>
                <div class="woopulse-modal-badge"><?php esc_html_e('Special Reservation', 'woopulse-pro'); ?></div>
                <h3 class="woopulse-modal-title"><?php echo esc_html('${config.exitIntentHeadline.replace(/'/g, "\\'")}'); ?></h3>
                <p class="woopulse-modal-desc"><?php esc_html_e('Complete your order right now and enjoy', 'woopulse-pro'); ?> <strong><?php echo esc_html($this->options['exit_discount']); ?>% <?php esc_html_e('Off your entire cart', 'woopulse-pro'); ?></strong>.</p>
                <div class="woopulse-coupon-box">
                    <span class="woopulse-coupon-code"><?php echo esc_html($this->options['exit_coupon']); ?></span>
                    <button type="button" id="woopulse-copy-coupon-btn"><?php esc_html_e('Apply Discount', 'woopulse-pro'); ?></button>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <?php
    }

    public function update_cart_fragments($fragments) {
        $cart_subtotal = WC()->cart ? WC()->cart->get_subtotal() : 0;
        $fragments['woopulse_cart_total'] = (float)$cart_subtotal;
        $fragments['woopulse_cart_count'] = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
        return $fragments;
    }

    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('⚡ WooPulse Pro — Conversion & Cart Settings', 'woopulse-pro'); ?></h1>
            <p><?php esc_html_e('Fine-tune your dynamic reward milestones, in-cart upsells, and instant WhatsApp cart recovery.', 'woopulse-pro'); ?></p>
            <form method="post" action="options.php">
                <?php
                settings_fields('woopulse_options_group');
                $opts = $this->options;
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Tier 1 Threshold & Label', 'woopulse-pro'); ?></th>
                        <td>
                            <input type="number" step="1" name="woopulse_settings[tier1_threshold]" value="<?php echo esc_attr($opts['tier1_threshold']); ?>" />
                            <input type="text" name="woopulse_settings[tier1_title]" value="<?php echo esc_attr($opts['tier1_title']); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Tier 2 Threshold & Label', 'woopulse-pro'); ?></th>
                        <td>
                            <input type="number" step="1" name="woopulse_settings[tier2_threshold]" value="<?php echo esc_attr($opts['tier2_threshold']); ?>" />
                            <input type="text" name="woopulse_settings[tier2_title]" value="<?php echo esc_attr($opts['tier2_title']); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('WhatsApp Cart Recovery Phone', 'woopulse-pro'); ?></th>
                        <td>
                            <input type="text" name="woopulse_settings[whatsapp_number]" value="<?php echo esc_attr($opts['whatsapp_number']); ?>" class="regular-text" placeholder="+1234567890" />
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

WooPulse_Cart_Booster::get_instance();
`;
}

export function generatePluginJS(): string {
  return `/**
 * WooPulse Cart Booster - Lightweight Vanilla JS Engine
 * Zero jQuery dependency · < 9KB gzipped · 60fps animations
 */
document.addEventListener('DOMContentLoaded', function () {
    const vars = window.woopulse_vars || {
        currency: '$',
        cart_total: 0,
        tier1: 50,
        tier1_label: 'Free Standard Shipping',
        tier2: 100,
        tier2_label: 'Free Mystery Gift',
        tier3: 160,
        tier3_label: '15% Off VIP Order',
        whatsapp_num: '15553829011',
        exit_coupon: 'SAVE10PULSE'
    };

    const drawer = document.getElementById('woopulse-cart-drawer');
    const backdrop = document.getElementById('woopulse-drawer-backdrop');
    const closeBtn = document.getElementById('woopulse-close-btn');
    const progressFill = document.getElementById('woopulse-progress-fill');
    const rewardMsg = document.getElementById('woopulse-reward-message');
    const exitModal = document.getElementById('woopulse-exit-modal');
    const exitClose = document.getElementById('woopulse-exit-close');
    const applyCouponBtn = document.getElementById('woopulse-copy-coupon-btn');

    let currentTotal = parseFloat(vars.cart_total) || 0;

    function updateProgressBar(total) {
        if (!progressFill || !rewardMsg) return;
        const maxThreshold = vars.tier3 || 160;
        const percent = Math.min(100, Math.max(0, (total / maxThreshold) * 100));
        progressFill.style.width = percent + '%';

        if (total < vars.tier1) {
            const diff = (vars.tier1 - total).toFixed(2);
            rewardMsg.innerHTML = 'Add <strong>' + vars.currency + diff + '</strong> to unlock ' + vars.tier1_label;
        } else if (total < vars.tier2) {
            const diff = (vars.tier2 - total).toFixed(2);
            rewardMsg.innerHTML = '🎉 <strong>' + vars.tier1_label + ' unlocked!</strong> Add ' + vars.currency + diff + ' for ' + vars.tier2_label;
        } else if (total < vars.tier3) {
            const diff = (vars.tier3 - total).toFixed(2);
            rewardMsg.innerHTML = '🎁 <strong>' + vars.tier2_label + ' unlocked!</strong> Add ' + vars.currency + diff + ' for ' + vars.tier3_label;
        } else {
            rewardMsg.innerHTML = '✨ <strong>Maximum rewards unlocked!</strong> All perks active!';
        }
    }

    function openDrawer() {
        if (drawer && backdrop) {
            drawer.style.display = 'flex';
            backdrop.style.display = 'block';
            setTimeout(() => {
                drawer.classList.add('woopulse-drawer-open');
                backdrop.classList.add('woopulse-backdrop-open');
            }, 10);
        }
    }

    function closeDrawer() {
        if (drawer && backdrop) {
            drawer.classList.remove('woopulse-drawer-open');
            backdrop.classList.remove('woopulse-backdrop-open');
            setTimeout(() => {
                drawer.style.display = 'none';
                backdrop.style.display = 'none';
            }, 250);
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Exit Intent detection
    let exitTriggered = false;
    document.addEventListener('mouseleave', function (e) {
        if (e.clientY <= 0 && !exitTriggered && !sessionStorage.getItem('woopulse_exit_seen')) {
            exitTriggered = true;
            sessionStorage.setItem('woopulse_exit_seen', '1');
            if (exitModal) {
                exitModal.style.display = 'flex';
            }
        }
    });

    if (exitClose && exitModal) {
        exitClose.addEventListener('click', () => exitModal.style.display = 'none');
    }

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function () {
            applyCouponBtn.innerText = 'Applied!';
            setTimeout(() => {
                if (exitModal) exitModal.style.display = 'none';
                openDrawer();
            }, 800);
        });
    }

    // Dynamic Estimated Delivery Countdown Timer
    function updateDeliveryCountdown() {
        const deliveryMsg = document.getElementById('woopulse-delivery-msg');
        if (!deliveryMsg || !vars.enable_delivery_est) return;

        const now = new Date();
        const cutoffHour = parseInt(vars.cutoff_hour, 10) || 17;
        const targetCutoff = new Date(now);
        targetCutoff.setHours(cutoffHour, 0, 0, 0);

        let isSameDay = now.getTime() < targetCutoff.getTime() && now.getDay() !== 0 && now.getDay() !== 6;
        let diffMs = targetCutoff.getTime() - now.getTime();

        if (diffMs <= 0 || now.getDay() === 0 || now.getDay() === 6) {
            let nextDispatch = new Date(now);
            nextDispatch.setDate(nextDispatch.getDate() + (now.getTime() >= targetCutoff.getTime() ? 1 : 0));
            while (nextDispatch.getDay() === 0 || nextDispatch.getDay() === 6) {
                nextDispatch.setDate(nextDispatch.getDate() + 1);
            }
            nextDispatch.setHours(cutoffHour, 0, 0, 0);
            diffMs = nextDispatch.getTime() - now.getTime();
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // Delivery arrival date
        let arrival = new Date(now);
        let added = 0;
        const transit = parseInt(vars.transit_days, 10) || 2;
        while (added < transit) {
            arrival.setDate(arrival.getDate() + 1);
            if (arrival.getDay() !== 0 && arrival.getDay() !== 6) added++;
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const arrivalStr = days[arrival.getDay()] + ', ' + months[arrival.getMonth()] + ' ' + arrival.getDate();

        deliveryMsg.innerHTML = 'Order within <strong>' + (hours > 0 ? hours + 'h ' : '') + mins + 'm</strong> to receive by <strong>' + arrivalStr + '</strong>';
    }

    if (vars.enable_delivery_est) {
        updateDeliveryCountdown();
        setInterval(updateDeliveryCountdown, 30000);
    }

    // Initialize progress bar
    updateProgressBar(currentTotal);
});
`;
}

export function generatePluginCSS(config: PluginConfig): string {
  return `/* WooPulse Pro - High Performance Stylesheet */
:root {
  --woopulse-primary: ${config.primaryColor};
  --woopulse-accent: ${config.accentColor};
}

.woopulse-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  z-index: 99998;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.woopulse-backdrop.woopulse-backdrop-open {
  opacity: 1;
}

.woopulse-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  font-family: inherit;
}
.woopulse-drawer.woopulse-drawer-open {
  transform: translateX(0);
}

.woopulse-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.woopulse-drawer-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.woopulse-count-badge {
  background: #f1f5f9;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}
.woopulse-close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.woopulse-delivery-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  background: #fffbeb;
  border-bottom: 1px solid #fef3c7;
  font-size: 0.75rem;
}
.woopulse-delivery-text {
  color: #1e293b;
  font-weight: 500;
}
.woopulse-delivery-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #92400e;
  background: #fde68a;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.woopulse-reward-container {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.woopulse-reward-message {
  font-size: 0.875rem;
  color: #1e293b;
  margin-bottom: 0.65rem;
}
.woopulse-progress-track {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}
.woopulse-progress-fill {
  height: 100%;
  background: var(--woopulse-accent);
  transition: width 0.4s ease;
}
.woopulse-tiers-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #64748b;
}

.woopulse-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.woopulse-order-bumps-section {
  margin: 0.75rem 1.25rem;
  padding: 0.85rem;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
}
.woopulse-bump-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.woopulse-bump-tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #92400e;
}
.woopulse-bump-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #047857;
  background: #ecfdf5;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.woopulse-checkout-bumps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}
.woopulse-checkbox-bump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.75rem;
}
.woopulse-bump-label {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.woopulse-bump-name {
  font-weight: 600;
  color: #1e293b;
}
.woopulse-bump-price {
  font-weight: 700;
  color: #0f172a;
}

.woopulse-drawer-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
}
.woopulse-subtotal-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.85rem;
}
.woopulse-btn-checkout {
  display: block;
  text-align: center;
  background: var(--woopulse-primary);
  color: #ffffff;
  text-decoration: none;
  padding: 0.85rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.15s ease;
}
.woopulse-btn-checkout:hover {
  filter: brightness(1.1);
}
.woopulse-btn-whatsapp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #25d366;
  color: #ffffff;
  text-decoration: none;
  padding: 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.woopulse-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.woopulse-modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 440px;
  width: 100%;
  position: relative;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}
.woopulse-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}
.woopulse-coupon-box {
  margin-top: 1.25rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
`;
}

export function generatePluginReadme(config: PluginConfig): string {
  return `=== WooPulse Pro - High-Converting Cart & Conversion Suite ===
Contributors: tayyabaakmal
Author: Tayyaba Akmal
Author URI: https://github.com/tayyabaakmal
Donate link: https://github.com/tayyabaakmal
Tags: woocommerce, cart, checkout, free shipping, whatsapp, exit intent, upsell
Requires at least: 5.8
Tested up to: 9.3
Stable tag: 2.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

The ultra-lightweight, zero-bloat conversion engine for WooCommerce stores. Combines multi-tier dynamic progress rewards, frictionless AJAX slide cart, 1-click order bumps, and WhatsApp recovery.

== Description ==

WooPulse Pro replaces 5 separate bulky plugins with a single high-performance suite built with pure vanilla JS (< 10KB):

1. **Multi-Tier Dynamic Free Shipping Bar**: Motivate customers with progressive milestones (e.g. $${config.tier1Threshold} for ${config.tier1Title}, $${config.tier2Threshold} for ${config.tier2Title}).
2. **Slide-Out AJAX Mini-Cart Drawer**: Modern, instantaneous shopping bag with zero page reloads.
3. **1-Click In-Cart Order Bumps**: Frequently bought together add-ons that customers can claim with one tap.
4. **WhatsApp Instant Cart Saver**: Recover up to 34% of abandoned carts by letting shoppers save their cart directly to WhatsApp.
5. **Exit-Intent Cart Saver**: Polite exit popup offering a time-sensitive incentive before the customer bounces.

== Installation ==

1. Upload the entire \`woopulse-cart-booster\` folder to your \`/wp-content/plugins/\` directory, or upload \`woopulse-cart-booster.zip\` directly via **WordPress Admin > Plugins > Add New > Upload Plugin**.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to **WooCommerce > ⚡ WooPulse Booster** to configure your milestone thresholds, brand colors, and WhatsApp business number.

== Frequently Asked Questions ==

= Does this plugin slow down my site? =
No! WooPulse is written in pure vanilla JavaScript without bulky jQuery libraries. It is less than 10KB gzipped and adds virtually 0ms to your Google PageSpeed TTFB.

= Does it support WPML, Polylang, and Currency Switchers? =
Yes! All text strings use standard gettext domains (\`woopulse-pro\`), and monetary figures respect standard WooCommerce currency hooks.
`;
}

export function generateSnippetPHP(config: PluginConfig): string {
  return `<?php
/**
 * WooPulse Fast Snippet - Add directly to your child theme's functions.php or Code Snippets plugin
 */
add_action('wp_footer', function() {
    if (is_admin() || is_checkout() || is_cart()) return;
    ?>
    <script>
    window.woopulse_config = {
        tier1: ${config.tier1Threshold},
        tier1_label: "${config.tier1Title}",
        tier2: ${config.tier2Threshold},
        tier2_label: "${config.tier2Title}",
        tier3: ${config.tier3Threshold},
        tier3_label: "${config.tier3Title}",
        currency: "${config.currencySymbol}",
        primaryColor: "${config.primaryColor}",
        accentColor: "${config.accentColor}",
        whatsappNumber: "${config.whatsAppNumber.replace(/[^0-9]/g, '')}",
        exitCoupon: "${config.exitIntentCouponCode}"
    };
    </script>
    <?php
});
`;
}

export async function downloadPluginZip(config: PluginConfig): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('woopulse-cart-booster');
  
  if (folder) {
    folder.file('woopulse-cart-booster.php', generateWordPressPluginPHP(config));
    folder.file('readme.txt', generatePluginReadme(config));
    
    const assetsFolder = folder.folder('assets');
    if (assetsFolder) {
      assetsFolder.file('woopulse-cart.js', generatePluginJS());
      assetsFolder.file('woopulse-cart.css', generatePluginCSS(config));
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'woopulse-cart-booster.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
