
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.53.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.53.1 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let nav0;
    	let button0;
    	let t1;
    	let div0;
    	let button1;
    	let t3;
    	let t4;
    	let t5;
    	let button2;
    	let t7;
    	let h10;
    	let t9;
    	let p0;
    	let t11;
    	let div6;
    	let div2;
    	let div1;
    	let p1;
    	let t12;
    	let t13_value = /*server_info*/ ctx[1]['Operating System'] + "";
    	let t13;
    	let t14;
    	let p2;
    	let t15;
    	let t16_value = /*server_info*/ ctx[1]['cpu'] + "";
    	let t16;
    	let t17;
    	let t18_value = /*server_info*/ ctx[1]['arch'] + "";
    	let t18;
    	let t19;
    	let p3;
    	let t20;
    	let t21_value = /*server_info*/ ctx[1]['mem_total'] + "";
    	let t21;
    	let t22;
    	let p4;
    	let t23;
    	let t24_value = /*server_info*/ ctx[1]['mem_free'] + "";
    	let t24;
    	let t25;
    	let div5;
    	let div3;
    	let p5;
    	let t27;
    	let div4;
    	let p6;
    	let t29;
    	let p7;
    	let t31;
    	let p8;
    	let t33;
    	let nav1;
    	let button3;
    	let t34;
    	let i0;
    	let t35;
    	let button4;
    	let t36;
    	let i1;
    	let t37;
    	let h11;
    	let t39;
    	let button5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav0 = element("nav");
    			button0 = element("button");
    			button0.textContent = "Triceratops";
    			t1 = space();
    			div0 = element("div");
    			button1 = element("button");
    			button1.textContent = "Star this Project";
    			t3 = text("\n        Votes: ");
    			t4 = text(/*vote_count*/ ctx[0]);
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Login";
    			t7 = space();
    			h10 = element("h1");
    			h10.textContent = "Admin Center";
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Please be patient, frontend is last priority is this project.";
    			t11 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			p1 = element("p");
    			t12 = text("Operating System: ");
    			t13 = text(t13_value);
    			t14 = space();
    			p2 = element("p");
    			t15 = text("CPU: ");
    			t16 = text(t16_value);
    			t17 = space();
    			t18 = text(t18_value);
    			t19 = space();
    			p3 = element("p");
    			t20 = text("Memory total: ");
    			t21 = text(t21_value);
    			t22 = space();
    			p4 = element("p");
    			t23 = text("Memory free: ");
    			t24 = text(t24_value);
    			t25 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p5 = element("p");
    			p5.textContent = "Uptime:";
    			t27 = space();
    			div4 = element("div");
    			p6 = element("p");
    			p6.textContent = "Network Subnet:";
    			t29 = space();
    			p7 = element("p");
    			p7.textContent = "Network Card:";
    			t31 = space();
    			p8 = element("p");
    			p8.textContent = "Public IP:";
    			t33 = space();
    			nav1 = element("nav");
    			button3 = element("button");
    			t34 = text("Shutdown server\n                        ");
    			i0 = element("i");
    			t35 = space();
    			button4 = element("button");
    			t36 = text("Check Logs \n                        ");
    			i1 = element("i");
    			t37 = space();
    			h11 = element("h1");
    			h11.textContent = "Test the app by running a Machine!";
    			t39 = space();
    			button5 = element("button");
    			button5.textContent = "Make Machine";
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning svelte-z1pbbq");
    			add_location(button0, file, 42, 7, 949);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-warning svelte-z1pbbq");
    			add_location(button1, file, 45, 8, 1059);
    			attr_dev(div0, "class", "vote svelte-z1pbbq");
    			add_location(div0, file, 44, 7, 1032);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-warning svelte-z1pbbq");
    			add_location(button2, file, 49, 7, 1202);
    			attr_dev(nav0, "class", "navbar svelte-z1pbbq");
    			add_location(nav0, file, 41, 4, 920);
    			attr_dev(h10, "class", "svelte-z1pbbq");
    			add_location(h10, file, 52, 4, 1280);
    			add_location(p0, file, 53, 1, 1303);
    			add_location(p1, file, 59, 16, 1484);
    			add_location(p2, file, 60, 16, 1559);
    			add_location(p3, file, 61, 16, 1630);
    			add_location(p4, file, 62, 16, 1694);
    			attr_dev(div1, "class", "machines svelte-z1pbbq");
    			add_location(div1, file, 58, 12, 1445);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file, 57, 8, 1415);
    			add_location(p5, file, 69, 16, 1948);
    			attr_dev(div3, "class", "col-sm machine-status svelte-z1pbbq");
    			add_location(div3, file, 68, 11, 1896);
    			add_location(p6, file, 72, 16, 2044);
    			add_location(p7, file, 73, 16, 2083);
    			add_location(p8, file, 74, 16, 2120);
    			attr_dev(i0, "class", "bi bi-exclamation-diamond");
    			add_location(i0, file, 78, 24, 2305);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-danger svelte-z1pbbq");
    			add_location(button3, file, 76, 20, 2195);
    			attr_dev(i1, "class", "bi bi-radioactive");
    			add_location(i1, file, 82, 24, 2504);
    			attr_dev(button4, "type", "button");
    			attr_dev(button4, "class", "btn btn-warning svelte-z1pbbq");
    			add_location(button4, file, 80, 20, 2397);
    			attr_dev(nav1, "class", "navbar svelte-z1pbbq");
    			add_location(nav1, file, 75, 16, 2154);
    			attr_dev(div4, "class", "col-sm machine-info svelte-z1pbbq");
    			add_location(div4, file, 71, 12, 1994);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file, 66, 8, 1783);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file, 56, 4, 1383);
    			attr_dev(h11, "class", "svelte-z1pbbq");
    			add_location(h11, file, 89, 4, 2641);
    			attr_dev(button5, "type", "button");
    			attr_dev(button5, "class", "btn btn-warning svelte-z1pbbq");
    			add_location(button5, file, 91, 4, 2745);
    			attr_dev(main, "class", "svelte-z1pbbq");
    			add_location(main, file, 40, 0, 909);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav0);
    			append_dev(nav0, button0);
    			append_dev(nav0, t1);
    			append_dev(nav0, div0);
    			append_dev(div0, button1);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(nav0, t5);
    			append_dev(nav0, button2);
    			append_dev(main, t7);
    			append_dev(main, h10);
    			append_dev(main, t9);
    			append_dev(main, p0);
    			append_dev(main, t11);
    			append_dev(main, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t12);
    			append_dev(p1, t13);
    			append_dev(div1, t14);
    			append_dev(div1, p2);
    			append_dev(p2, t15);
    			append_dev(p2, t16);
    			append_dev(p2, t17);
    			append_dev(p2, t18);
    			append_dev(div1, t19);
    			append_dev(div1, p3);
    			append_dev(p3, t20);
    			append_dev(p3, t21);
    			append_dev(div1, t22);
    			append_dev(div1, p4);
    			append_dev(p4, t23);
    			append_dev(p4, t24);
    			append_dev(div6, t25);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p5);
    			append_dev(div5, t27);
    			append_dev(div5, div4);
    			append_dev(div4, p6);
    			append_dev(div4, t29);
    			append_dev(div4, p7);
    			append_dev(div4, t31);
    			append_dev(div4, p8);
    			append_dev(div4, t33);
    			append_dev(div4, nav1);
    			append_dev(nav1, button3);
    			append_dev(button3, t34);
    			append_dev(button3, i0);
    			append_dev(nav1, t35);
    			append_dev(nav1, button4);
    			append_dev(button4, t36);
    			append_dev(button4, i1);
    			append_dev(main, t37);
    			append_dev(main, h11);
    			append_dev(main, t39);
    			append_dev(main, button5);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", /*MakeVote*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*vote_count*/ 1) set_data_dev(t4, /*vote_count*/ ctx[0]);
    			if (dirty & /*server_info*/ 2 && t13_value !== (t13_value = /*server_info*/ ctx[1]['Operating System'] + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*server_info*/ 2 && t16_value !== (t16_value = /*server_info*/ ctx[1]['cpu'] + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*server_info*/ 2 && t18_value !== (t18_value = /*server_info*/ ctx[1]['arch'] + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*server_info*/ 2 && t21_value !== (t21_value = /*server_info*/ ctx[1]['mem_total'] + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*server_info*/ 2 && t24_value !== (t24_value = /*server_info*/ ctx[1]['mem_free'] + "")) set_data_dev(t24, t24_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const votes = "http://backend:8080/api/get_votes";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let vote_count = 0;
    	let has_voted = false;

    	onMount(async function () {
    		GetVotes();
    	});

    	async function GetVotes() {
    		const response = await fetch(votes);
    		const data = await response.json();
    		$$invalidate(0, vote_count = data["votes"]);
    	}

    	function MakeVote() {
    		if (!has_voted) {
    			// Yes I know this can be abusable, be patient
    			fetch(votes, { method: 'POST' });

    			has_voted = true;
    			GetVotes();
    		}
    	}

    	let server_info = "";

    	async function GetServerInfo() {
    		const response = await fetch("http://backend:8080/api/get_server");
    		const data = await response.json();
    		$$invalidate(1, server_info = data);
    		console.log(data);
    	}

    	GetServerInfo();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		votes,
    		vote_count,
    		has_voted,
    		GetVotes,
    		MakeVote,
    		server_info,
    		GetServerInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ('vote_count' in $$props) $$invalidate(0, vote_count = $$props.vote_count);
    		if ('has_voted' in $$props) has_voted = $$props.has_voted;
    		if ('server_info' in $$props) $$invalidate(1, server_info = $$props.server_info);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [vote_count, server_info, MakeVote];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: 'world',
      },
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
